import React, { useState, useEffect, useCallback } from "react";

/**
 * media: array of strings (youtubeID or local image path)
 */
export default function ProjectGalleryClient({ media = [] }) {
  // parse media into objects once
  const parsedMedia = media.map(item => {
    const isYouTube = /^[A-Za-z0-9_-]{10,}$/.test(item);
    return isYouTube
      ? { type: "youtube", id: item, thumbnail: `https://i.ytimg.com/vi/${item}/hqdefault.jpg` }
      : { type: "image", src: item, thumbnail: item };
  });

  // activeIndex controls what's shown in the main preview
  const [activeIndex, setActiveIndex] = useState(parsedMedia.length ? 0 : -1);
  // lightboxIndex === null -> closed
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // helpers
  const clampIndex = (i) => {
    if (!parsedMedia.length) return -1;
    return ((i % parsedMedia.length) + parsedMedia.length) % parsedMedia.length;
  };

  // open lightbox at a given index
  const openLightbox = (idx) => {
    setLightboxIndex(clampIndex(idx));
  };

  // keyboard handlers while lightbox open
  const onKeyDown = useCallback((e) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") {
      setLightboxIndex(null);
      return;
    }
    if (e.key === "ArrowRight") {
      setLightboxIndex(prev => clampIndex(prev + 1));
    }
    if (e.key === "ArrowLeft") {
      setLightboxIndex(prev => clampIndex(prev - 1));
    }
  }, [lightboxIndex, parsedMedia.length]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [lightboxIndex, onKeyDown]);

  // if no media, render nothing
  if (activeIndex === -1) return null;

  const active = parsedMedia[activeIndex];

  return (
    <div className="project-gallery">

      {/* MAIN MEDIA (click abre lightbox para imagen/video) */}
      <div
        className="pg-main aspect-wrapper"
        onClick={() => openLightbox(activeIndex)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") openLightbox(activeIndex); }}
      >
        {active.type === "youtube" ? (
          // show thumbnail preview with play overlay (no iframe here)
          <>
            <img src={active.thumbnail} alt="video preview" />
            <div className="video-play-overlay">▶</div>
          </>
        ) : (
          <img src={active.src} alt="project image" />
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="pg-thumbs">
        {parsedMedia.map((item, i) => (
          <div
            key={i}
            className={`thumb-container ${i === activeIndex ? "active-thumb" : ""}`}
            onClick={() => setActiveIndex(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveIndex(i); }}
          >
            <img src={item.thumbnail} className="thumb" alt={`thumb-${i}`} />
            {item.type === "youtube" && <div className="thumb-video-badge">▶</div>}
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (
        <div
          className="lightbox"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {parsedMedia[lightboxIndex].type === "image" && (
              <img
                src={parsedMedia[lightboxIndex].src}
                className="lightbox-img"
                alt="full"
              />
            )}

            {parsedMedia[lightboxIndex].type === "youtube" && (
              <div className="video-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${parsedMedia[lightboxIndex].id}?rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* flechas */}
            <div
              className="lb-arrow left"
              onClick={() => setLightboxIndex(prev => clampIndex(prev - 1))}
            >
              ‹
            </div>

            <div
              className="lb-arrow right"
              onClick={() => setLightboxIndex(prev => clampIndex(prev + 1))}
            >
              ›
            </div>

            {/* contador */}
            <div className="lb-counter">
              {lightboxIndex + 1} / {parsedMedia.length}
            </div>

            {/* cerrar */}
            <div className="lb-close" onClick={() => setLightboxIndex(null)}>
              ✕
            </div>
          </div>
        </div>
      )}


    </div>
  );
}






// // src/components/ProjectGalleryClient.jsx
// import React, { useState, useEffect, useRef } from "react";
// import "./ProjectGallery.css"; // asegúrate de tener este archivo o mover estilos a global

// export default function ProjectGalleryClient({ media }) {
//   // Normalizar media a array vacío si viene undefined/null
//   const safeMedia = Array.isArray(media) ? media : [];

//   // selected: índice del item seleccionado; -1 = ninguno / placeholder
//   const [selected, setSelected] = useState(safeMedia.length ? 0 : -1);
//   const mainRef = useRef(null);

//   // Si la prop media cambia dinámicamente, ajustamos selected
//   useEffect(() => {
//     if (safeMedia.length === 0) {
//       setSelected(-1);
//       return;
//     }
//     // Si antes no había nada y ahora sí, seleccionamos el primero
//     if (selected === -1 && safeMedia.length > 0) {
//       setSelected(0);
//       return;
//     }
//     // Si el índice seleccionado excede el nuevo tamaño, lo recortamos
//     if (selected >= safeMedia.length) {
//       setSelected(safeMedia.length - 1);
//     }
//   }, [media]); // dependemos de media (prop) para reaccionar a cambios

//   // Fade simple al cambiar seleccionado
//   useEffect(() => {
//     const el = mainRef.current;
//     if (!el) return;
//     el.classList.remove("fade-in");
//     // trigger reflow para reiniciar la animación
//     void el.offsetWidth;
//     el.classList.add("fade-in");
//   }, [selected]);

//   const current = selected >= 0 ? safeMedia[selected] : null;

//   return (
//     <div className="gallery">
//       <div className="gallery-main" ref={mainRef}>
//         {current ? (
//           current.type === "video" ? (
//             // El video NO hace autoplay; el usuario debe pulsar play
//             <video
//               key={current.src}
//               src={current.src}
//               controls
//               playsInline
//               preload="metadata"
//               className="gallery-video"
//             />
//           ) : (
//             <img
//               key={current.src}
//               src={current.src}
//               alt={`Preview ${selected + 1}`}
//               className="gallery-image"
//             />
//           )
//         ) : (
//           <div className="gallery-placeholder">
//             <p>No media available</p>
//           </div>
//         )}
//       </div>

//       {safeMedia.length > 0 && (
//         <div className="gallery-thumbs" role="list">
//           {safeMedia.map((item, i) => (
//             <button
//               key={i}
//               className={`thumb ${i === selected ? "active" : ""}`}
//               onClick={() => setSelected(i)}
//               aria-label={`Select media ${i + 1}`}
//             >
//               {item.type === "video" ? (
//                 <video src={item.src} muted loop playsInline preload="metadata" />
//               ) : (
//                 <img src={item.src} alt={`Thumbnail ${i + 1}`} />
//               )}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// // import React, { useEffect, useRef, useState } from "react";

// // export default function ProjectGallery({ media = [] }) {
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const mainRef = useRef(null);
// //   const thumbsRef = useRef(null);

// //   useEffect(() => {
// //     function onKey(e) {
// //       if (e.key === "ArrowRight") next();
// //       if (e.key === "ArrowLeft") prev();
// //       if (e.key === "Escape") setCurrentIndex(0);
// //     }
// //     window.addEventListener("keydown", onKey);
// //     return () => window.removeEventListener("keydown", onKey);
// //   }, [currentIndex]);

// //   useEffect(() => {
// //     // ensure active thumbnail is visible
// //     const thumbs = thumbsRef.current;
// //     const active = thumbs?.querySelectorAll(".thumb-btn")[currentIndex];
// //     if (active && thumbs) {
// //       const rect = active.getBoundingClientRect();
// //       const parentRect = thumbs.getBoundingClientRect();
// //       if (rect.left < parentRect.left || rect.right > parentRect.right) {
// //         active.scrollIntoView({ behavior: "smooth", inline: "center" });
// //       }
// //     }
// //   }, [currentIndex]);

// //   function prev() {
// //     setCurrentIndex((i) => (i - 1 + media.length) % media.length);
// //   }

// //   function next() {
// //     setCurrentIndex((i) => (i + 1) % media.length);
// //   }

// //   const current = media[currentIndex] || {};

// //   return (
// //     <div className="gallery" aria-roledescription="image gallery">
// //       <div className="gallery-main" ref={mainRef}>
// //         <button
// //           className="gallery-nav gallery-nav-left"
// //           aria-label="Previous"
// //           onClick={prev}
// //         >
// //           ‹
// //         </button>

// //         {current.type === "video" ? (
// //           <video
// //             key={current.src}
// //             src={current.src}
// //             controls
// //             playsInline
// //             className="gallery-video"
// //           />
// //         ) : (
// //           <img
// //             key={current.src}
// //             src={current.src}
// //             alt={current.alt || `Preview ${currentIndex + 1}`}
// //             className="gallery-image"
// //           />
// //         )}

// //         <button
// //           className="gallery-nav gallery-nav-right"
// //           aria-label="Next"
// //           onClick={next}
// //         >
// //           ›
// //         </button>
// //       </div>

// //       <div className="gallery-footer">
// //         <div className="gallery-counter">{`${currentIndex + 1}/${media.length}`}</div>
// //         <div className="gallery-thumbnails" ref={thumbsRef} role="list">
// //           {media.map((item, i) => (
// //             <button
// //               key={i}
// //               role="listitem"
// //               className={`thumb-btn ${i === currentIndex ? "active" : ""}`}
// //               onClick={() => setCurrentIndex(i)}
// //               onMouseEnter={(e) => {
// //                 // if thumbnail is video, play preview
// //                 const vid = e.currentTarget.querySelector("video");
// //                 if (vid) vid.play().catch(() => {});
// //               }}
// //               onMouseLeave={(e) => {
// //                 const vid = e.currentTarget.querySelector("video");
// //                 if (vid) {
// //                   vid.pause();
// //                   vid.currentTime = 0;
// //                 }
// //               }}
// //               aria-label={`Show ${i + 1}`}
// //             >
// //               {item.type === "video" ? (
// //                 <video muted loop playsInline preload="metadata">
// //                   <source src={item.src} type="video/mp4" />
// //                 </video>
// //               ) : (
// //                 <img src={item.src} alt={item.alt || `Thumbnail ${i + 1}`} />
// //               )}
// //             </button>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
