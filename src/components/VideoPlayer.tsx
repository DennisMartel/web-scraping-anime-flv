import { useEffect, useState } from "react";

interface VideoPlayerProps {
  slug: string
  episode: number
}

interface VideoData {
  src: string,
  server: string,
  title: string,
}

const VideoPlayer = ({
  slug,
  episode
}: VideoPlayerProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [videoLinks, setVideoLinks] = useState<VideoData[]>([]);
  const [playing, setPlaying] = useState<VideoData | null>(null);

  useEffect(() => {
    getVideoLinks()
  }, []);

  const getVideoLinks = async () => {
    try {
      const res = await fetch(`https://www3.animeflv.net/ver/${slug}-${episode}`);
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const scripts = doc.querySelectorAll<HTMLScriptElement>("script");

      scripts.forEach((script) => {
        const content = script.textContent || "";
        if (content.includes("var videos = {")) {
          const videoParts = content.split("var videos = ")[1]?.split(";")[0];
          if (videoParts) {
            try {
              const data = JSON.parse(videoParts);

              const videos: any[] = [];
              if ("SUB" in data) {
                data.SUB.map((item: any) => {
                  videos.push({
                    src: item.code || "",
                    server: item.server || "",
                    title: item.title || ""
                  })
                });
              }

              if ("LAT" in data) {
                data.LAT.map((item: any) => {
                  videos.push({
                    src: item.code || "",
                    server: item.server || "",
                    title: item.title || ""
                  })
                });
              }
              setVideoLinks(videos);
              setLoading(false);
              setPlaying(videos[0]);
            } catch (e) {
              setLoading(false);
            }
          }
        }
      })
    } catch (error) {
      setLoading(false);
    }
  }

  const selectServer = (server: string) => {
    const newPlayer = videoLinks.find((video) => video.server === server);
    newPlayer ? setPlaying(newPlayer) : alert("No se encontro ningun video con el servidor especificado");
  }

  if (loading) {
    return <div>Cargando enlace del video...</div>
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        {videoLinks?.map((video: any) => (
          <button onClick={() => selectServer(video.server)}>{video.title}</button>
        ))}
      </div>
      <iframe
        src={playing?.src}
        width={1250}
        height={600}
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
};

export default VideoPlayer;
