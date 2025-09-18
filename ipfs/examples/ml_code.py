import numpy as np
import tensorflow as tf

# Training data
X = np.array([1, 2, 3, 4, 5], dtype=float)
Y = np.array([2, 4, 6, 8, 10], dtype=float)

# Define a simple model: 1 input → 1 output
model = tf.keras.Sequential([tf.keras.layers.Dense(units=1, input_shape=[1])])

# Compile with optimizer + loss
model.compile(optimizer="sgd", loss="mean_squared_error")

# Train (fit)
model.fit(X, Y, epochs=500, verbose=0)

# Results
print("Prediction for x=6:", model.predict(np.array([6.0]))[0][0])
