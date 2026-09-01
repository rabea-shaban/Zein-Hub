import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #0A1626 0%, #102238 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E5A91A",
          fontWeight: 900,
          borderRadius: 8,
          border: "1.5px solid rgba(229, 169, 26, 0.6)",
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
