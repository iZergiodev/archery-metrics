import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'

type I18nContextValue = {
    lang: Lang
    setLang: (lang: Lang) => void
    t: (key: string) => string
}

const translations: Record<Lang, Record<string, string>> = {
    es: {
        'app.title': 'Configuración de arco',

        'section.bowSpecs': 'Especificaciones del arco',
        'section.arrowSpecs': 'Especificaciones de la flecha',
        'section.weightOnString': 'Peso en la cuerda',

        'field.iboVelocity': 'Velocidad IBO',
        'field.drawLength': 'Longitud de tiro',
        'field.drawWeight': 'Peso de tiro',
        'field.braceHeight': 'Altura del brazo',
        'field.axleToAxle': 'Eje a eje',
        'field.percentLetoff': 'Porcentaje de liberación',
        'field.camAggressiveness': 'Agresividad de poleas',

        'field.pointWeight': 'Peso de la punta',
        'field.insertWeight': 'Peso del inserto',
        'field.shaftLength': 'Longitud del eje',
        'field.shaftGpi': 'GPI del eje',
        'field.fletchQuantity': 'Cantidad de plumas',
        'field.weightEach': 'Peso de cada una',
        'field.wrapWeight': 'Peso del envoltorio',
        'field.nockWeight': 'Peso de la muesca',
        'field.bushingPin': 'Casquillo/pasador',
        'field.staticSpine': 'Columna estática',
        'field.staticSpine.tooltip': 'Este es el valor de rigidez marcado en tu flecha por el fabricante (ej: 0.340, 0.400, 0.500). NO es lo que queremos calcular, sino el valor de la flecha que YA TIENES o estás probando. La app verificará si esa flecha es adecuada para tu arco.',

        'field.peep': 'Mirilla',
        'field.dLoop': 'D-loop',
        'field.nockPoint': 'Punta de la muesca',
        'field.silencers': 'Silenciadores',
        'field.silencerDfc': 'Silenciador DFC',
        'field.release': 'Liberación',
        'field.stringMaterial': 'Material de la cuerda',

        'summary.spineRequired': 'Rigidez requerida (spine)',
        'summary.spineDynamic': 'Rigidez dinámica (spine)',
        'summary.match': 'Emparejamiento',
        'summary.arrowWeight': 'Peso de la flecha',
        'summary.foc': 'FOC (Front of Center)',

        'match.weak': 'Débil (flecha blanda)',
        'match.good': 'Bueno',
        'match.stiff': 'Rígido (flecha rígida)',
        'match.na': 'N/D',

        'option.release.post': 'Liberación posterior',
        'option.release.pre': 'Liberación previa',
        'option.stringMaterial.dacron': 'Dacrón',
        'option.stringMaterial.fastflight': 'FastFlight',
        'option.stringMaterial.unknown': 'Desconocido',

        'option.cam.soft': 'Suave (Round)',
        'option.cam.medium': 'Media (Hybrid/Single)',
        'option.cam.hard': 'Dura (Turbo/Speed)',
    },
    en: {
        'app.title': 'Archery Setup',

        'section.bowSpecs': 'Bow Specs',
        'section.arrowSpecs': 'Arrow Specs',
        'section.weightOnString': 'Weight On String',

        'field.iboVelocity': 'IBO Velocity',
        'field.drawLength': 'Draw Length',
        'field.drawWeight': 'Draw Weight',
        'field.braceHeight': 'Brace Height',
        'field.axleToAxle': 'Axle To Axle',
        'field.percentLetoff': 'Percent Letoff',
        'field.camAggressiveness': 'Cam Aggressiveness',

        'field.pointWeight': 'Point Weight',
        'field.insertWeight': 'Insert Weight',
        'field.shaftLength': 'Shaft Length',
        'field.shaftGpi': 'Shaft GPI',
        'field.fletchQuantity': 'Fletch Quantity',
        'field.weightEach': 'Weight Each',
        'field.wrapWeight': 'Wrap Weight',
        'field.nockWeight': 'Nock Weight',
        'field.bushingPin': 'Bushing/Pin',
        'field.staticSpine': 'Static Spine',
        'field.staticSpine.tooltip': 'This is the stiffness value marked on your arrow by the manufacturer (e.g., 0.340, 0.400, 0.500). This is NOT what we want to calculate, but the value of the arrow you ALREADY HAVE or are testing. The app will verify if that arrow is suitable for your bow.',

        'field.peep': 'Peep',
        'field.dLoop': 'D-loop',
        'field.nockPoint': 'Nock Point',
        'field.silencers': 'Silencers',
        'field.silencerDfc': 'Silencer DFC',
        'field.release': 'Release',
        'field.stringMaterial': 'String Material',

        'summary.spineRequired': 'Required spine',
        'summary.spineDynamic': 'Dynamic spine',
        'summary.match': 'Match',
        'summary.arrowWeight': 'Arrow weight',
        'summary.foc': 'FOC (Front of Center)',

        'match.weak': 'Weak (soft arrow)',
        'match.good': 'Good',
        'match.stiff': 'Stiff (stiff arrow)',
        'match.na': 'N/A',

        'option.release.post': 'Post Gate Release',
        'option.release.pre': 'Pre Gate Release',
        'option.stringMaterial.dacron': 'Dacron',
        'option.stringMaterial.fastflight': 'FastFlight',
        'option.stringMaterial.unknown': 'Unknown',

        'option.cam.soft': 'Soft (Round)',
        'option.cam.medium': 'Medium (Hybrid/Single)',
        'option.cam.hard': 'Hard (Turbo/Speed)',
    },
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('es')

    const t = (key: string): string => {
        const table = translations[lang]
        return table[key] ?? key
    }

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext)
    if (!ctx) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    return ctx
}
