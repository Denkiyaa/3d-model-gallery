import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './Context/LanguageContext';
import { DarkModeContext } from './Context/DarkModeContext';
import './ModelGallery.css';

const ModelGallery = () => {
  const { translations } = useContext(LanguageContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const models = [
    { id: 1, name: 'Articulated Axolotl', thumbnailPath: '/assets/axolotl.png', modelPath: '/assets/axolotl.stl' },
    { id: 2, name: 'Chamfered D20', thumbnailPath: '/assets/d20.png', modelPath: '/assets/d20.stl' },
    // Add more models as needed
  ];

  const handleModelClick = (model) => {
    navigate(`/model/${model.id}`, { state: { modelPath: model.modelPath, modelName: model.name } });
  };

  return (
    <div className={`gallery ${darkMode ? 'dark-mode' : ''}`}>
      {models.map((model) => (
        <div key={model.id} className="model-card" onClick={() => handleModelClick(model)}>
          <img src={model.thumbnailPath} alt={`Thumbnail for ${model.name}`} className="thumbnail" />
          <h3 className="model-name">{translations[model.name] || model.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default ModelGallery;