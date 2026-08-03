import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 112,
          color: 'white',
          background: '#18181b',
          fontFamily: 'Arial, sans-serif',
          fontSize: 300,
          fontWeight: 800,
        }}
      >
        T
      </div>
    ),
    size,
  );
}
