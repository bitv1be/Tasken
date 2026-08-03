import { ImageResponse } from 'next/og';

export const alt =
  'Tasken — порядок в личных задачах';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#18181b',
          background:
            'linear-gradient(135deg, #eff6ff 0%, #ffffff 48%, #f0fdf4 100%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              color: 'white',
              background: '#18181b',
            }}
          >
            T
          </div>
          Tasken
        </div>

        <div
          style={{
            maxWidth: 980,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.045em',
            }}
          >
            Порядок в задачах. Спокойствие в голове.
          </div>
          <div
            style={{
              color: '#52525b',
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            Личные задачи, Markdown и безопасное хранение в одном
            понятном пространстве.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
