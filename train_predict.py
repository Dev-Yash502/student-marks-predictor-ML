import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

def main():
    print("=== Student Marks Prediction Model Training (React Project) ===")
    
    # Create public directory if it doesn't exist (Vite static folder)
    public_dir = 'public'
    os.makedirs(public_dir, exist_ok=True)
    
    # 1. Generate Synthetic Dataset
    np.random.seed(42)
    study_hours = np.random.uniform(1.0, 10.0, 150)
    noise = np.random.normal(0, 5, 150)
    marks = 12.0 + 8.5 * study_hours + noise
    marks = np.clip(marks, 0, 100)
    
    df = pd.DataFrame({
        'Study_Hours': study_hours,
        'Marks': marks
    })
    
    # Save the dataset to public CSV
    csv_path = os.path.join(public_dir, 'student_marks_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"[SUCCESS] Created dataset with {len(df)} records and saved to '{csv_path}'")
    
    # 2. Prepare Data for Training
    X = df[['Study_Hours']]
    y = df['Marks']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"[SUCCESS] Data split: {len(X_train)} training samples, {len(X_test)} testing samples")
    
    # 3. Train the Linear Regression Model
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("[SUCCESS] Linear Regression model trained successfully")
    
    slope = float(model.coef_[0])
    intercept = float(model.intercept_)
    print(f"    - Fitted Equation: Marks = ({slope:.4f} * Study_Hours) + {intercept:.4f}")
    
    # 4. Evaluate Model on Test Set
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    
    print("\n--- Model Evaluation ---")
    print(f"R-squared (R2) Score: {r2:.4f}  (Explains {r2*100:.2f}% of variance)")
    print(f"Mean Squared Error:    {mse:.4f}")
    print(f"Mean Absolute Error:   {mae:.4f} marks")
    
    # 5. Export Parameters for Frontend to public folder
    metadata = {
        "slope": round(slope, 4),
        "intercept": round(intercept, 4),
        "metrics": {
            "r2_score": round(r2, 4),
            "mse": round(mse, 4),
            "mae": round(mae, 4),
            "total_samples": len(df)
        }
    }
    
    json_path = os.path.join(public_dir, 'model_parameters.json')
    with open(json_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"[SUCCESS] Exported model parameters to '{json_path}'")
    
    # 6. Plot the Regression Line & Save Image to public folder
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 6), dpi=150)
    
    ax.scatter(X_train, y_train, color='#00f0ff', alpha=0.6, edgecolors='none', label='Training Data')
    ax.scatter(X_test, y_test, color='#ff007f', alpha=0.8, edgecolors='none', label='Testing Data')
    
    x_line = np.linspace(1, 10, 100).reshape(-1, 1)
    y_line = model.predict(x_line)
    
    ax.plot(x_line, y_line, color='#ffbc00', linewidth=3, label=f'Regression Line (Y = {slope:.2f}X + {intercept:.2f})')
    
    ax.grid(True, linestyle='--', alpha=0.2, color='#ffffff')
    ax.set_title('Study Hours vs Marks Regression Plot', fontsize=14, fontweight='bold', pad=15, color='#ffffff')
    ax.set_xlabel('Study Hours per Day', fontsize=12, labelpad=10, color='#e0e0e0')
    ax.set_ylabel('Marks Obtained (Percentage)', fontsize=12, labelpad=10, color='#e0e0e0')
    ax.legend(facecolor='#1e1e1e', edgecolor='#333333', loc='upper left')
    
    for spine in ['top', 'right', 'left', 'bottom']:
        ax.spines[spine].set_color('#333333')
        
    plt.tight_layout()
    plot_path = os.path.join(public_dir, 'regression_plot.png')
    plt.savefig(plot_path, bbox_inches='tight', transparent=True)
    plt.close()
    print(f"[SUCCESS] Saved regression plot visualization to '{plot_path}'")
    
    print("\nTraining completed successfully! Ready for the React interface.")

if __name__ == "__main__":
    main()
