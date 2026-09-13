import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

print("🚀 Training FairDispatch MONTHLY vs WEEKLY Workload Balancer...")
np.random.seed(42)
n_samples = 20000

fleet_weekly_avg = 55
monthly_avgs = {'D1':3.2, 'D2':4.1, 'D3':2.8, 'D4':5.0}

# FIXED: All arrays same length n_samples
data = pd.DataFrame({
    'weekly_effort': np.random.normal(55, 15, n_samples),
    'monthly_load': np.random.choice(list(monthly_avgs.values()), n_samples),
    'esp32_steps': np.random.normal(6500, 2500, n_samples),
    'route_difficulty': np.random.uniform(20, 90, n_samples),
    'fairness_adjust': np.zeros(n_samples, dtype=int)  # FIXED: np.zeros(n_samples)
})

print(f"✅ DataFrame created: {data.shape}")

# YOUR LOGIC - populate fairness_adjust
for i in range(n_samples):
    monthly = data.loc[i, 'monthly_load']
    weekly = data.loc[i, 'weekly_effort']
    if monthly < weekly * 0.8:  # Lagging → HARD
        data.loc[i, 'fairness_adjust'] = 2
    elif monthly > weekly * 1.2:  # Ahead → EASY
        data.loc[i, 'fairness_adjust'] = 0
    else:  # Balanced → MED
        data.loc[i, 'fairness_adjust'] = 1

print("✅ Logic applied. Samples per class:")
print(data['fairness_adjust'].value_counts())

X = data[['weekly_effort', 'monthly_load', 'esp32_steps', 'route_difficulty']]
y = data['fairness_adjust']

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y)

# Test accuracy
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
accuracy = model.score(X_test, y_test)
print(f"✅ Model Accuracy: {accuracy:.1%}")

os.makedirs('models', exist_ok=True)
joblib.dump(model, "models/rotation-model.joblib")
print("✅ SAVED: models/rotation-model.joblib (Ready!)")
print("📊 Run 'http-server . -p 8080 -o' to test website!")
