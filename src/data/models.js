export const modelsData = [
  {
    id: 1,
    name: "Axolotl",
    modelPath: "/models/model1/model.stl",
    description: "Articulated axolotl model",
    images: [
      "/models/model1/image1.jpg",
      "/models/model1/image2.jpg"
    ],
    thumbnailPath: "/models/model1/thumbnail.png"
  },
  {
    id: 2,
    name: "D20 Dice",
    modelPath: "/models/model2/model.stl",
    description: "20 sided dnd dice model",
    images: [
      "/models/model2/image1.jpg",
      "/models/model2/image2.jpg"
    ],
    thumbnailPath: "/models/model2/thumbnail.png"
  },
  // Add more models as needed
];

export const getRelatedModels = (currentModelId) => {
  return modelsData.filter(model => model.id !== currentModelId);
}; 