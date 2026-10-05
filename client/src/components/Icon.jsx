const paths = {
  home: 'M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z',
  search: 'M10 2a8 8 0 105.3 14l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z',
  library: 'M4 4h2v16H4zm5 0h2v16H9zm4.5.5l1.9-.5 4 15.5-1.9.5z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
  next: 'M6 18l8.5-6L6 6zm9-12v12h2V6z',
  prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  heart: 'M12 21l-1.5-1.3C5.4 15.1 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3.4 6.6-8.5 11.2z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
  upload: 'M5 20h14v-2H5zm7-16l-5.5 5.5 1.4 1.4L11 7.8V16h2V7.8l3.1 3.1 1.4-1.4z',
  collab: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-.9.1 1.1.8 1.9 1.9 1.9 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z',
  volume: 'M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.5-.7 2.5-2.2 2.5-4.02z',
  left: 'M15.5 4l-8 8 8 8 1.4-1.4L10.3 12l6.6-6.6z',
  right: 'M8.5 4l8 8-8 8-1.4-1.4 6.6-6.6-6.6-6.6z',
  more: 'M6 10a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z',
  queue: 'M3 6h14v2H3zm0 4h14v2H3zm0 4h9v2H3zm13 0v6l5-3z',
  check: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
};

export default function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}
