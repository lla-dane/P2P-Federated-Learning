# Training data: X -> y (y = 2x)
X = [1, 2, 3, 4]
y = [2, 4, 6, 8]

# Initialize weight (w) and bias (b)
w, b = 0.0, 0.0
lr = 0.01  # learning rate

# Train for 1000 steps
for _ in range(1000):
    dw, db = 0, 0
    for xi, yi in zip(X, y):
        y_pred = w * xi + b
        dw += (y_pred - yi) * xi
        db += (y_pred - yi)
    w -= lr * dw / len(X)
    b -= lr * db / len(X)

print("Learned weight:", w)
print("Learned bias:", b)

# Prediction
x_test = 5
y_pred = w * x_test + b
print("Prediction for 5:", y_pred)
