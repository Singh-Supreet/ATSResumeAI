import './Loader.scss';

export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  if (fullScreen) {
    return (
      <div className="loader-screen">
        <div className="loader-screen__inner">
          <div className="loader loader--lg" />
          {text && <p className="loader-screen__text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loader-wrapper loader-wrapper--${size}`}>
      <div className={`loader loader--${size}`} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}
