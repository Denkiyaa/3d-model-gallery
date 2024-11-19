import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkModeContext } from './Context/DarkModeContext';
import './HomePage.css';
import { Helmet } from 'react-helmet';


const HomePage = () => {
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const models = [
    { id: 1, name: 'Articulated Axolotl', thumbnailPath: '/assets/axolotl.png', modelPath: '/assets/axolotl.stl'},
    { id: 2, name: 'Chamfered D20', thumbnailPath: '/assets/d20.png', modelPath: '/assets/d20.stl'},
    // Daha fazla model ekleyin
  ];

  const handleModelClick = (model) => {
    navigate(`/model/${model.id}`, { state: { modelPath: model.modelPath, modelName: model.name } });
  };

  return (
    <>
      {/* Helmet kullanarak başlığı güncelliyoruz */}
      <Helmet>
        <title>Craftedfromfilament - 3D Model Gallery</title>
        <meta name="description" content="Discover handcrafted 3D models and more in our gallery." />
      </Helmet>

    <div className="homepage-container">
      {/* Model Galerisi */}
      <div className={`gallery ${darkMode ? 'dark-mode' : ''}`}>
        {models.map((model) => (
          <div key={model.id} className="model-card" onClick={() => handleModelClick(model)}>
            <img src={model.thumbnailPath} alt={`Thumbnail for ${model.name}`} className="thumbnail" />
            <div className="model-info">
              <h3 className="model-name">{model.name}</h3>
              <p className="model-description">{model.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default HomePage;
