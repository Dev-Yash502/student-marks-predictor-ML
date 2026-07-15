import { useState, useEffect } from 'react';
import LightRays from './LightRays';

// Default fallback parameters (pre-trained weights) in case model_parameters.json fetch is blocked
const DEFAULT_PARAMS = {
  slope: 8.6215,
  intercept: 11.8079,
  metrics: {
    r2_score: 0.9793,
    mse: 11.5686,
    mae: 2.9023,
    total_samples: 150
  }
};

function App() {
  const [studyHours, setStudyHours] = useState(5.0);
  const [modelParams, setModelParams] = useState(DEFAULT_PARAMS);
  const [isMetricsCollapsed, setIsMetricsCollapsed] = useState(true);
  const [plotTimestamp, setPlotTimestamp] = useState(Date.now());

  // Load Model Parameters on mount
  useEffect(() => {
    async function fetchParams() {
      try {
        const response = await fetch('/model_parameters.json');
        if (response.ok) {
          const data = await response.json();
          setModelParams(data);
          console.log("Model parameters loaded successfully in React:", data);
        } else {
          console.warn("Using default pre-trained fallback weights.");
        }
      } catch (err) {
        console.warn("Using default pre-trained fallback weights. Run train_predict.py to generate.", err);
      }
    }
    fetchParams();

    // Check for updated matplotlib plot at intervals
    const interval = setInterval(() => {
      setPlotTimestamp(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute live prediction: Y = mX + C
  const rawScore = (modelParams.slope * studyHours) + modelParams.intercept;
  const score = Math.max(0, Math.min(100, rawScore));

  // Gauge dimensions (radius 50 -> perimeter ~314.15)
  const perimeter = 314.15;
  const dashoffset = perimeter - (perimeter * score / 100);

  // Grade categorization
  const getGradeInfo = (scoreVal) => {
    if (scoreVal >= 90) return { name: 'O (Outstanding)', color: 'var(--color-green)' };
    if (scoreVal >= 80) return { name: 'A+ (Excellent)', color: 'var(--color-green)' };
    if (scoreVal >= 70) return { name: 'A (Very Good)', color: 'var(--color-accent)' };
    if (scoreVal >= 60) return { name: 'B+ (Good)', color: 'var(--color-gold)' };
    if (scoreVal >= 50) return { name: 'B (Above Avg)', color: 'var(--color-orange)' };
    if (scoreVal >= 40) return { name: 'C (Pass)', color: 'var(--color-orange)' };
    return { name: 'F (Fail)', color: 'var(--color-red)' };
  };

  const gradeInfo = getGradeInfo(score);

  // Advisor logic
  const getAdvisorInfo = () => {
    const calculateHoursNeeded = (targetScore) => {
      return (targetScore - modelParams.intercept) / modelParams.slope;
    };

    if (score < 40) {
      const passHours = calculateHoursNeeded(40);
      return {
        borderColor: 'var(--color-red)',
        advice: `⚠️ <strong>Academic Risk Alert:</strong> Studying ${studyHours.toFixed(1)} hours/day is insufficient and predicts a failing grade (${score.toFixed(1)}%). To pass the course (scoring 40%), you should study for at least <strong>${passHours.toFixed(1)} hours</strong> per day.`
      };
    }
    if (score >= 90) {
      return {
        borderColor: 'var(--color-green)',
        advice: `🏆 <strong>Excellent Achievement:</strong> Studying ${studyHours.toFixed(1)} hours/day predicts an Outstanding score (${score.toFixed(1)}%). You are maximizing your potential; make sure to maintain a balanced sleep schedule!`
      };
    }

    const grades = [
      { limit: 40, name: 'Pass Grade (C)', val: 40 },
      { limit: 50, name: 'Above Average (B)', val: 50 },
      { limit: 60, name: 'Good Grade (B+)', val: 60 },
      { limit: 70, name: 'Very Good Grade (A)', val: 70 },
      { limit: 80, name: 'Excellent Grade (A+)', val: 80 },
      { limit: 90, name: 'Outstanding Grade (O)', val: 90 }
    ];

    let nextGrade = null;
    for (const g of grades) {
      if (score < g.limit) {
        nextGrade = g;
        break;
      }
    }

    if (nextGrade) {
      const targetHours = calculateHoursNeeded(nextGrade.val);
      const additionalHours = targetHours - studyHours;
      let borderColor = 'var(--color-orange)';
      if (score >= 70) borderColor = 'var(--color-accent)';
      else if (score >= 50) borderColor = 'var(--color-gold)';

      return {
        borderColor,
        advice: `📈 <strong>Study Strategy:</strong> Studying ${studyHours.toFixed(1)} hours/day yields a solid score of ${score.toFixed(1)}%. You can raise your performance to an <strong>${nextGrade.name}</strong> by studying for an additional <strong>${additionalHours.toFixed(1)} hours</strong> (totaling <strong>${targetHours.toFixed(1)} hours/day</strong>).`
      };
    }

    return { borderColor: 'var(--color-accent)', advice: '' };
  };

  const advisorInfo = getAdvisorInfo();

  // Slider change handler
  const handleSliderChange = (e) => {
    setStudyHours(parseFloat(e.target.value));
  };

  // Preset button handler
  const selectPreset = (hours) => {
    setStudyHours(hours);
  };

  return (
    <>
      <div className="mesh-bg"></div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#66FCF1"
          raysSpeed={1.0}
          lightSpread={0.8}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.02}
          distortion={0.03}
          className="custom-rays"
          fadeDistance={0.8}
        />
      </div>
      
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-area">
            <span className="pulse-indicator"></span>
            <h1>PredictMark AI</h1>
          </div>
          <div className="header-badge">Supervised ML - Linear Regression</div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Controls Panel */}
          <section className="card control-panel">
            <h2 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Input Parameters
            </h2>

            <div className="control-group">
              <div className="slider-header">
                <label htmlFor="hours-slider">Study Hours / Day</label>
                <span className="value-badge">{studyHours.toFixed(1)} hrs</span>
              </div>
              <div className="range-container">
                <input 
                  type="range" 
                  id="hours-slider" 
                  min="0" 
                  max="10" 
                  step="0.1" 
                  value={studyHours} 
                  onChange={handleSliderChange} 
                />
                <div 
                  className="range-track-fill" 
                  style={{ width: `${(studyHours / 10) * 100}%` }}
                ></div>
              </div>
              <div className="range-labels">
                <span>0 hrs (No Study)</span>
                <span>10 hrs (Max Study)</span>
              </div>
            </div>

            {/* Presets */}
            <div className="preset-group">
              <span className="preset-title">Quick Presets:</span>
              <div className="presets-row">
                <button 
                  className={`preset-btn ${studyHours === 2.0 ? 'active' : ''}`}
                  onClick={() => selectPreset(2.0)}
                >
                  Casual (2h)
                </button>
                <button 
                  className={`preset-btn ${studyHours === 5.0 ? 'active' : ''}`}
                  onClick={() => selectPreset(5.0)}
                >
                  Standard (5h)
                </button>
                <button 
                  className={`preset-btn ${studyHours === 8.0 ? 'active' : ''}`}
                  onClick={() => selectPreset(8.0)}
                >
                  Dedicated (8h)
                </button>
                <button 
                  className={`preset-btn ${studyHours === 10.0 ? 'active' : ''}`}
                  onClick={() => selectPreset(10.0)}
                >
                  Crammer (10h)
                </button>
              </div>
            </div>

            {/* Model Insights Table */}
            <div className="metrics-block">
              <div 
                className="metrics-header" 
                onClick={() => setIsMetricsCollapsed(!isMetricsCollapsed)}
              >
                <h3>Model Performance Insights</h3>
                <svg 
                  className={`chevron ${isMetricsCollapsed ? 'collapsed' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className={`metrics-content ${isMetricsCollapsed ? 'collapsed' : ''}`}>
                <div className="metric-row">
                  <span className="metric-label">Algorithm</span>
                  <span className="metric-value text-gold">Linear Regression</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">R² Fit Score</span>
                  <span className="metric-value">{(modelParams.metrics.r2_score * 100).toFixed(2)}%</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Mean Squared Error (MSE)</span>
                  <span className="metric-value">{modelParams.metrics.mse.toFixed(4)}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Mean Absolute Error (MAE)</span>
                  <span className="metric-value">{modelParams.metrics.mae.toFixed(4)} marks</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Training Sample Size</span>
                  <span className="metric-value">{modelParams.metrics.total_samples} students</span>
                </div>
              </div>
            </div>
          </section>

          {/* Predictions Panel */}
          <section className="card prediction-panel">
            <h2 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Prediction Results
            </h2>

            <div className="prediction-display">
              <div className="gauge-row">
                <div className="gauge-container">
                  <svg className="gauge-svg" viewBox="0 0 120 120">
                    <circle className="gauge-bg" cx="60" cy="60" r="50"></circle>
                    <circle 
                      className="gauge-fill" 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      stroke={gradeInfo.color}
                      strokeDasharray="314.15" 
                      strokeDashoffset={dashoffset}
                      style={{ filter: `drop-shadow(0 0 8px ${gradeInfo.color}40)` }}
                    ></circle>
                  </svg>
                  <div className="gauge-text">
                    <span className="marks-number" style={{ color: gradeInfo.color }}>
                      {score.toFixed(1)}%
                    </span>
                    <span 
                      className="marks-label" 
                      style={{ 
                        color: gradeInfo.color,
                        background: `${gradeInfo.color}15`
                      }}
                    >
                      {gradeInfo.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="equation-card">
                <span className="card-label">Regression Equation (Y = mX + C)</span>
                <div className="formula-text">
                  Marks = (<span className="coef-val">{modelParams.slope.toFixed(2)}</span> × <span className="input-val">{studyHours.toFixed(1)}</span>) + <span className="coef-val">{modelParams.intercept.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Advisor Recommendation */}
            <div 
              className="advisor-card" 
              style={{ borderLeftColor: advisorInfo.borderColor }}
            >
              <div className="advisor-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                Performance Recommendation
              </div>
              <p 
                className="advisor-text" 
                dangerouslySetInnerHTML={{ __html: advisorInfo.advice }}
              ></p>
            </div>
          </section>
        </div>

        {/* Matplotlib Visualization */}
        <div className="visuals-row">
          <section className="card visual-card">
            <h2 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Model Regression Visualization
            </h2>
            <div className="chart-wrapper">
              <div className="image-container">
                <img 
                  id="matplotlib-plot" 
                  src={`/regression_plot.png?t=${plotTimestamp}`} 
                  alt="Regression line plot showing Study Hours vs Marks. Highlighting training/testing scatter points and the golden regression line."
                  onError={(e) => {
                    e.target.style.display = 'none';
                    document.getElementById('chart-fallback').style.display = 'flex';
                  }}
                />
                <div id="chart-fallback" className="fallback-chart-container" style={{ display: 'none' }}>
                  <p>Plot Image generating or missing. Run train_predict.py to generate.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Project Info */}
        <footer className="card project-info">
          <div className="info-section">
            <h3>Project Description</h3>
            <p>This mini AI/ML project predicts a student's marks based on the number of study hours. The system uses the <strong>Linear Regression</strong> algorithm to learn from sample data and estimate marks for new input values. It demonstrates the basic concepts of Machine Learning, including data collection, model training, evaluation, and prediction.</p>
          </div>
          
          <div className="info-grid">
            <div>
              <h3>Key Features</h3>
              <ul className="styled-list">
                <li>Takes daily study hours as input dynamically</li>
                <li>Predicts expected percentage marks instantly</li>
                <li>Calculates statistical metrics (R², MSE, MAE)</li>
                <li>Demonstrates supervised machine learning with linear modeling</li>
              </ul>
            </div>
            <div>
              <h3>Learning Outcomes</h3>
              <ul className="styled-list">
                <li>Understanding supervised Machine Learning basics</li>
                <li>Working with tabular datasets (Pandas)</li>
                <li>Training and testing regression models (Scikit-Learn)</li>
                <li>Making predictions using algebraic equations</li>
              </ul>
            </div>
          </div>
          <div className="info-footer">
            <span>Project Level: <strong>Beginner (Mini Project)</strong></span>
            <span>Created for hands-on ML educational demonstration</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
