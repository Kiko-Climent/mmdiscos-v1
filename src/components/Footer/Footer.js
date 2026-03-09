export default function Footer() {
    return (
      <div
        className="w-full h-[80vh]"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(22px) saturate(140%)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
        }}
      >
        <div className="w-full h-full flex flex-col items-start justify-between pl-[2rem] about-text">
          <h1
            className="
              w-full
              pt-6
              text-nowrap
              font-white
              leading-[0.9]
              tracking-[-0.05em]
              text-[clamp(1.5em,5vw,7rem)]
            "
          >
            MM DISCOS © 2026
          </h1>
          <div className="w-full h-full flex flex-col items-start justify-end leading-none pb-[1rem]">
            <p className="text-[clamp(1.4rem,2.8vw,3.2rem)] uppercase w-full">
                contact
            </p>
            <p className="text-[clamp(1.4rem,2.8vw,3.2rem)] uppercase w-full">
                bandcamp
            </p>
            <p className="text-[clamp(1.4rem,2.8vw,3.2rem)] uppercase w-full">
                instagram
            </p>
            <p className="text-[clamp(1.4rem,2.8vw,3.2rem)] uppercase w-full">
                soundcloud
            </p>
          </div>
        </div>
      </div>
    );
  }