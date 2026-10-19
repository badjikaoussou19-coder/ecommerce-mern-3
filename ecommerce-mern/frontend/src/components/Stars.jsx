// Affichage (value) ou saisie (onChange) d'une note de 1 à 5
export default function Stars({ value = 0, onChange, size = '1rem' }) {
  return (
    <span className="stars" style={{ fontSize: size }} role={onChange ? 'radiogroup' : 'img'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button type="button" key={n} className={n <= value ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>★</button>
        ) : (
          <span key={n} className={n <= Math.round(value) ? 'on' : ''} aria-hidden="true">★</span>
        )
      )}
    </span>
  );
}
