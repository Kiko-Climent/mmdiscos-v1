export default function ComingSoon() {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-gray-300 mix-blend-difference">
        <div className="flex flex-col text-xl -space-y-3 justify-center items-center">
          <h1>coming soon</h1>
        </div>
        <div className="flex flex-col text-9xl -space-y-3 justify-center items-center">
          {/* <h1>b: https://mmdiscos.bandcamp.com/</h1>
          <h1>i: https://www.instagram.com/mm.discos/</h1>
          <h1>s: https://soundcloud.com/mmdiscos</h1> */}
          <h1>MM</h1>
        </div>
        <div className="flex flex-col text-xl  -space-y-3 justify-center items-center">
          <h1>b: https://mmdiscos.bandcamp.com/</h1>
          <h1>i: https://www.instagram.com/mm.discos/</h1>
          <h1>s: https://soundcloud.com/mmdiscos</h1>
        </div>
      </div>
    </div>
  )
}