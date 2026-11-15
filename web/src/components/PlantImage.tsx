import { useState } from "react"

type PlantImageProps = {
  src?: string
  alt: string
  className?: string
}



const PlantImage = ({ src, alt, className = "" }: PlantImageProps) => {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (no photo)`}
        className={`flex items-center justify-center bg-gradient-to-br from-leaf-100 to-leaf-200 text-leaf-600 ${className}`}
      >
        <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c0-4.5 2.7-7.5 8-7.5 0 4.5-2.7 7.5-8 7.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c0-3.5-2.2-6-6.5-6 0 3.5 2.2 6 6.5 6Z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

export default PlantImage







































//image eka cse una
// import { useState } from "react"

// type PlantImageProps = {
//   src?: string
//   alt: string
//   className?: string
// }

// // Shows the plant photo, or a green placeholder when there is no image / it fails to load
// const PlantImage = ({ src, alt, className = "" }: PlantImageProps) => {
//   const [failed, setFailed] = useState(false)

//   if (!src || failed) {
//     return (
//       <div
//         role="img"
//         aria-label={`${alt} (no photo)`}
//         className={`flex items-center justify-center bg-gradient-to-br from-leaf-100 to-leaf-200 text-5xl ${className}`}
//       >
//         🪴
//       </div>
//     )
//   }

//   return (
//     <img
//       src={src}
//       alt={alt}
//       loading="lazy"
//       onError={() => setFailed(true)}
//       className={`object-cover ${className}`}
//     />
//   )
// }

// export default PlantImage
