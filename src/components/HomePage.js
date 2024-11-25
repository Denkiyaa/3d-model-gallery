import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkModeContext } from './Context/DarkModeContext';
import './HomePage.css';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { modelsData } from '../data/models';

// Helper functions
export const getModelById = (id) => {
  return modelsData.find(model => model.id === parseInt(id));
};

export const getRelatedModels = (currentId) => {
  return modelsData.filter(model => model.id !== parseInt(currentId));
};

const HomePage = () => {
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const handleModelClick = (model) => {
    navigate(`/model/${model.id}`, { 
      state: { 
        modelPath: model.modelPath, 
        modelName: model.name,
        description: model.description,
        modelId: model.id,
        images: model.images
      } 
    });
  };

  return (
    <>
      <Helmet>
        <title>Craftedfromfilament</title>
        <meta name="description" content="Discover handcrafted 3D models and more in our gallery." />
      </Helmet>

      <div className="homepage-container">
        <div className={`gallery ${darkMode ? 'dark-mode' : ''}`}>
          {modelsData.map((model) => (
            <Link
              key={model.id}
              to={`/model/${model.id}`}
              state={{ modelId: model.id }}
            >
              <div className="model-card" onClick={() => handleModelClick(model)}>
                <img src={model.thumbnailPath} alt={`Thumbnail for ${model.name}`} className="thumbnail" />
                <div className="model-info">
                  <h3 className="model-name">{model.name}</h3>
                  <p className="model-description">{model.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
