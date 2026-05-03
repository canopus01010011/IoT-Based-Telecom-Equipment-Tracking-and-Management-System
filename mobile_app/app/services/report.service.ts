
export const submitReport = async (data: {
  missionId: string;
  text: string;
  images: string[];
}) => {
  const formData = new FormData();

  formData.append("missionId", data.missionId);
  formData.append("text", data.text);

  data.images.forEach((uri, index) => {
    formData.append("images", {
      uri,
      name: `photo_${index}.jpg`,
      type: "image/jpeg",
    } as any);
  });

  const baseURL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
  const url = `${baseURL}/reports`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};
