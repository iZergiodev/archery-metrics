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

        'field.iboVelocity': 'Velocidad (IBO)',
        'field.drawLength': 'Longitud de apertura',
        'field.drawWeight': 'Potencia (libras)',
        'field.braceHeight': 'Altura de brace (distancia)',
        'field.axleToAxle': 'Eje a eje',
        'field.percentLetoff': 'Porcentaje de alivio (letoff)',

        'field.pointWeight': 'Peso de la punta',
        'field.insertWeight': 'Peso del inserto',
        'field.shaftLength': 'Longitud del vástago',
        'field.shaftGpi': 'GPI del vástago (grains/pulgada)',
        'field.fletchQuantity': 'Cantidad de plumas',
        'field.weightEach': 'Peso por pluma',
        'field.wrapWeight': 'Peso del envoltorio (wrap/vinilo)',
        'field.nockWeight': 'Peso del culatín (nock)',
        'field.bushingPin': 'Peso del casquillo/perno',
        'field.staticSpine': 'Rigidez estática (spine)',

        'field.peep': 'Peep (visor en cuerda)',
        'field.dLoop': 'Lazo en cuerda (D-loop)',
        'field.nockPoint': 'Punto de enganche (nock point)',
        'field.silencers': 'Silenciadores',
        'field.silencerDfc': 'Silenciador DFC (fibra de carbono)',
        'field.release': 'Tipo de liberación',

        'summary.spineRequired': 'Rigidez requerida (spine)',
        'summary.spineDynamic': 'Rigidez dinámica (spine)',
        'summary.match': 'Emparejamiento',
        'summary.arrowWeight': 'Peso de la flecha',

        'match.weak': 'Débil (flecha blanda)',
        'match.good': 'Bueno',
        'match.stiff': 'Rígido (flecha rígida)',
        'match.na': 'N/D',

        'option.release.post': 'Liberación Post Gate',
        'option.release.pre': 'Liberación Pre Gate',
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

        'field.peep': 'Peep',
        'field.dLoop': 'D-loop',
        'field.nockPoint': 'Nock Point',
        'field.silencers': 'Silencers',
        'field.silencerDfc': 'Silencer DFC',
        'field.release': 'Release',

        'summary.spineRequired': 'Required spine',
        'summary.spineDynamic': 'Dynamic spine',
        'summary.match': 'Match',
        'summary.arrowWeight': 'Arrow weight',

        'match.weak': 'Weak (soft arrow)',
        'match.good': 'Good',
        'match.stiff': 'Stiff (stiff arrow)',
        'match.na': 'N/A',

        'option.release.post': 'Post Gate Release',
        'option.release.pre': 'Pre Gate Release',
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
