from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# dataset is already provided by exec_globals in train_on_chunk
df = dataset.copy()  # noqa: F821

# Drop id column (not useful for training)
df = df.drop(columns=["id"])

# Encode diagnosis (M = 1, B = 0)
label_encoder = LabelEncoder()
df["diagnosis"] = label_encoder.fit_transform(df["diagnosis"])

# Features and target
X = df.drop(columns=["diagnosis"])
y = df["diagnosis"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train model
model = LogisticRegression(max_iter=500)
model.fit(X_train, y_train)

# Evaluate
acc = model.score(X_test, y_test)
print(f"Validation Accuracy: {acc:.4f}")

# Save model weights (coefficients + intercept + scaler parameters)
model_weights = {
    "coefficients": model.coef_.tolist(),
    "intercept": model.intercept_.tolist(),
    "classes": model.classes_.tolist(),
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
}
