export default function ComingSoon2() {
  return(
    <div className="w-screen h-screen relative">
      <div className="w-full h-full">
        <video
          src="/video/Video MM Header.mp4"
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 right-0 -translate-y-1/2 w-full text-gray-300">
        <div className="flex flex-col text-[12.5rem] leading-[9.5rem] justify-end items-end">
          <h1>https://</h1>
          <h1>mmdiscos.</h1>
          <h1>bandcamp.com/</h1>
          {/* <h1>i: https://www.instagram.com/mm.discos/</h1>
          <h1>s: https://soundcloud.com/mmdiscos</h1> */}
        </div>
      </div>
    </div>
  )
}