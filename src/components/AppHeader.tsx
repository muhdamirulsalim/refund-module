import zusLogoWhite from '../assets/zus-logo-white.png'

export function AppHeader() {
  return (
    <header className="w-full bg-brand shadow-sm">
      <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8">
        <img
          src={zusLogoWhite}
          alt="ZUS Coffee"
          className="h-9 w-auto object-contain object-left"
        />
      </div>
    </header>
  )
}
