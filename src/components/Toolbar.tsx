import { useState } from 'react'

interface ToolbarProps {
  onSave: (slot: number) => void
  onLoad: (slot: number) => void
  onClear: () => void
  lang: 'es' | 'en'
  onSetLang: (lang: 'es' | 'en') => void
  t: {
    (key: string): string
  }
}

export function Toolbar({ onSave, onLoad, onClear, lang, onSetLang }: ToolbarProps) {
  const [showMenu, setShowMenu] = useState(false)

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  return (
    <div className="relative">
      {/* Mobile: Hamburger menu + Quick actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Language Toggle */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => onSetLang('es')}
            className={`px-2 py-1.5 rounded transition-colors ${
              lang === 'es' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => onSetLang('en')}
            className={`px-2 py-1.5 rounded transition-colors ${
              lang === 'en' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        {/* Quick Clear Button */}
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium
                     border border-red-600/50 bg-red-500/10 text-red-400
                     hover:bg-red-500/20 transition-colors md:hidden"
        >
          <span>Limpiar</span>
        </button>

        {/* Desktop: Full toolbar visible */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 mr-1">Config:</span>
          {[1, 2, 3].map((slot) => (
            <button
              key={`save-${slot}`}
              onClick={() => onSave(slot)}
              className="px-3 py-1.5 rounded text-xs font-medium
                         border border-emerald-600/50 bg-emerald-500/10 text-emerald-400
                         hover:bg-emerald-500/20 transition-colors"
            >
              S{slot}
            </button>
          ))}
          <div className="w-px h-5 bg-slate-600 mx-1"></div>
          {[1, 2, 3].map((slot) => (
            <button
              key={`load-${slot}`}
              onClick={() => onLoad(slot)}
              className="px-3 py-1.5 rounded text-xs font-medium
                         border border-sky-600/50 bg-sky-500/10 text-sky-400
                         hover:bg-sky-500/20 transition-colors"
            >
              L{slot}
            </button>
          ))}
          <div className="w-px h-5 bg-slate-600 mx-1"></div>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded text-xs font-medium
                       border border-red-600/50 bg-red-500/10 text-red-400
                       hover:bg-red-500/20 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Mobile: Menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile: Dropdown menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-xs text-slate-500 px-2 py-1">Guardar</div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[1, 2, 3].map((slot) => (
                <button
                  key={`save-mobile-${slot}`}
                  onClick={() => { onSave(slot); setShowMenu(false) }}
                  className="px-3 py-2 rounded text-xs font-medium
                             border border-emerald-600/50 bg-emerald-500/10 text-emerald-400"
                >
                  S{slot}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 px-2 py-1">Cargar</div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[1, 2, 3].map((slot) => (
                <button
                  key={`load-mobile-${slot}`}
                  onClick={() => { onLoad(slot); setShowMenu(false) }}
                  className="px-3 py-2 rounded text-xs font-medium
                             border border-sky-600/50 bg-sky-500/10 text-sky-400"
                >
                  L{slot}
                </button>
              ))}
            </div>

            <button
              onClick={() => { onClear(); setShowMenu(false) }}
              className="w-full mt-1 px-3 py-2 rounded text-xs font-medium
                         border border-red-600/50 bg-red-500/10 text-red-400"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
