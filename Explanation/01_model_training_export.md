# Stage 1: Model Training & Export

**What This Stage Does:** This is where PulmoCareAI begins.

Everything in this project — the web app, the Grad-CAM heatmaps, the clinical reports — depends on one thing: a trained model that can look at a lung CT scan and answer, *"Is this cancerous or not?"*

This stage takes 999 raw lung CT images and turns them into a `.h5` file — a frozen, portable brain — that the Flask app can load and use. It also produces a `lung_cancer_model_metadata.json` file that tells the Flask app *how* to use that brain correctly.

All of this happens inside `PulmoCareAI_Deep_Learning_Project.ipynb`, running on Google Colab.

---

## Why 999 Images Is a Small Dataset (and What Problems That Creates)

Deep learning models are pattern-hungry. A model like ResNet50 was originally trained on ImageNet — a dataset of **over 14 million images** across 20,000+ categories. Your dataset has **999 images** across just 2 categories.

**Real-world analogy:** Imagine training a new doctor to diagnose lung cancer, but only giving them 999 X-rays to study — ever. A real radiologist sees thousands of scans over years of residency. Your model is that new doctor, and 999 images is a dangerously thin education.

This creates three specific problems in your code:

### 1. The Model Will Memorize, Not Generalize

With so few images, the model risks learning the *specific noise and quirks* of your 999 images rather than the *general patterns* of cancer. In deep learning, this is called **overfitting** — the model scores 95% on training data but fails miserably on new scans it has never seen.

Your notebook fights this with:
- **Data augmentation** via `ImageDataGenerator` — randomly rotating, shifting, flipping, and zooming training images to artificially create "new" samples
- **Dropout layers** (`Dropout(0.5)`) — randomly disabling 50% of neurons during training so no single neuron can memorize the data
- **EarlyStopping** callback with `patience=7` — halting training if validation loss hasn't improved in 7 epochs

### 2. The Classes Are Imbalanced

Your 999 images are not split equally:

| Class | Count | Percentage |
|---|---|---|
| `non_cancerous` | 738 | ~73.9% |
| `cancerous` | 261 | ~26.1% |

There are **nearly 3× more non-cancerous images** than cancerous ones.

**Real-world analogy:** Imagine a student studying for a true/false exam where 74% of the answers are "false." The laziest strategy? Just answer "false" for everything — you'd get 74% correct without learning anything. That's exactly what your early models did. The v2 EfficientNetB0 model predicted **all 200 test images as non-cancerous (class 1)** and got 74% accuracy — because 74% of the test images *were* non-cancerous.

Your notebook uses `class_weight.compute_class_weight('balanced', ...)` to calculate what these ratios should be:
```python
class_weights = {0: 0.6768, 1: 1.9138}  # cancerous class gets ~2.83× more weight
```

Later experiments used **even stronger weights**:
```python
stronger_class_weights = {0: 3.0, 1: 1.0}  # 3× emphasis on cancerous
```

And the final Focal Loss experiment pushed this even further with **8:1 extreme class weights**.

### 3. The Data Split Is Tight

With only 999 images, every image counts. Your notebook splits them:

| Split | Count | Purpose |
|---|---|---|
| Training (`train_df`) | 639 | The model learns from these |
| Validation (`val_df`) | 160 | Used during training to check progress |
| Testing (`test_df`) | 200 | Held out completely — the final exam |

639 training images is very little. This is why transfer learning (explained next) is non-negotiable for this project.

---

## Why ResNet50 Was Chosen and What Transfer Learning Means

### The Problem with Training from Scratch

A deep learning model needs to learn *features* — edges, textures, shapes, structures. If you trained a model from scratch with only 639 training images, it would need to learn everything from the ground up: what an edge looks like, what a circle is, what a texture pattern means. With 639 images, that's impossible.

### Transfer Learning: Standing on the Shoulders of Giants

**Real-world analogy:** Instead of teaching that new doctor everything from "this is a bone" to "this is a tumor," you hire a doctor who already graduated medical school (they know anatomy, cells, tissue structures) and then give them a short specialization course in lung cancer radiology. They bring their existing knowledge and just learn the final, specific skill.

That's what your code does:

```python
base_model = tf.keras.applications.ResNet50(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)
base_model.trainable = False  # Freeze the pre-trained knowledge
```

- `weights='imagenet'` — loads a model pre-trained on 14+ million images. ResNet50 already "knows" how to see edges, textures, shapes, and complex structures.
- `include_top=False` — removes ResNet50's original classification head (which was designed for 1,000 ImageNet categories like "cat," "dog," "airplane"). You don't need to classify airplanes.
- `base_model.trainable = False` — **freezes** all 23+ million pre-trained parameters. The model's existing knowledge is locked in place.

### Why ResNet50 Specifically?

Your notebook actually tried **two** base models as part of the experimental journey:

| Architecture | Parameters | Model Size | Used In |
|---|---|---|---|
| EfficientNetB0 | ~4.2M total, ~164K trainable | 16-25 MB | Early experiments |
| ResNet50 | ~25.6M total | 92-96 MB | Final Focal Loss model |

**EfficientNetB0** was the first attempt — it's smaller and more parameter-efficient. But the early EfficientNetB0 models all suffered from the **class collapse problem** (predicting everything as non-cancerous).

**ResNet50** was brought in for the Focal Loss experiment. It's a larger, more powerful feature extractor with deeper residual connections. The combination of ResNet50's richer features + Focal Loss + extreme class weights was what finally produced a model with genuine class separation.

### The Custom Classification Head

After the frozen base model, your code adds custom layers to make the final cancerous/non-cancerous decision:

```python
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
```

**Real-world analogy:** The frozen ResNet50 is a sophisticated microscope that can see tissue structure. The custom head layers (Dense 512 → 256 → 64 → 1) are the doctor sitting behind the microscope making the final diagnosis. Only the doctor's decision-making is being trained; the microscope stays the same.

The final `Dense(1, activation='sigmoid')` outputs a single number between 0 and 1:
- Close to **0** → model thinks it's **cancerous** (class index 0)
- Close to **1** → model thinks it's **non-cancerous** (class index 1)

This class mapping (`{'cancerous': 0, 'non_cancerous': 1}`) is stored in `train_generator.class_indices` and saved into the metadata JSON so Stage 2 interprets the predictions correctly.

---

## What Focal Loss Is and Why It Was Used

### The Standard Approach: Binary Cross-Entropy

Your first training runs used standard `binary_crossentropy` as the loss function:

```python
model.compile(optimizer=Adam(learning_rate=0.0001),
              loss='binary_crossentropy',
              metrics=['accuracy', 'precision', 'recall'])
```

Binary cross-entropy treats every prediction error equally. If the model misclassifies a cancerous scan vs. a non-cancerous scan, the penalty is the same.

### The Problem: Easy Examples Drown Out Hard Ones

**Real-world analogy:** Imagine a classroom of 999 students taking a test. 738 students find the test trivially easy (the "non-cancerous" cases the model already handles well). 261 students struggle badly (the "cancerous" cases the model can't detect). Standard cross-entropy is like a teacher who spends equal time helping the easy students and the struggling ones — the struggling students' needs get drowned out by the majority.

With imbalanced data, the model quickly learns to get the majority class right (easy examples) and stops trying to learn the minority class (hard examples). The gradient signals from correctly classified easy samples overwhelm the gradients from misclassified hard samples.

### Focal Loss: Pay More Attention to What You Get Wrong

Focal Loss was introduced by Lin et al. (2017) specifically for this problem. Your notebook implements it as a custom loss function:

```python
def focal_loss(gamma=2.0, alpha=0.75):
    def focal_loss_fn(y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, epsilon, 1 - epsilon)
        # Cross-entropy component
        cross_entropy = -y_true * tf.math.log(y_pred) - (1 - y_true) * tf.math.log(1 - y_pred)
        # Focal weight: (1 - p_t)^gamma
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        focal_weight = tf.pow(1 - p_t, gamma)
        # Alpha balancing
        alpha_t = y_true * alpha + (1 - y_true) * (1 - alpha)
        loss = alpha_t * focal_weight * cross_entropy
        return tf.reduce_mean(loss)
    return focal_loss_fn
```

The key mechanism is `focal_weight = tf.pow(1 - p_t, gamma)`:

| How confident the model is | `p_t` value | `(1 - p_t)^2` (focal weight) | Effect |
|---|---|---|---|
| 95% confident and **correct** | 0.95 | 0.0025 | Almost **zero** loss — stop wasting gradient on this |
| 50% confident (uncertain) | 0.50 | 0.25 | **Moderate** loss — worth learning from |
| 10% confident and **wrong** | 0.10 | 0.81 | **High** loss — the model should focus here |

**Real-world analogy:** Focal Loss is like a teacher who ignores the students acing the test and spends nearly all their time with the students who are failing. The `gamma=2.0` parameter controls how aggressively the teacher ignores easy students. The `alpha=0.75` parameter gives extra importance to the cancerous class.

Combined with **extreme class weights** (`{0: 8.0, 1: 1.0}` — 8× emphasis on cancerous samples), the Focal Loss training forced the model to pay attention to cancerous patterns instead of taking the lazy shortcut of predicting everything as non-cancerous.

---

## What the Training Loop Actually Does (Per Epoch)

Your notebook uses `model.fit()` which executes the following internally for each epoch:

### Step 1: Forward Pass (Batch by Batch)

The 639 training images are loaded in batches via `train_generator` (batch size = 32). For each batch:
1. **32 images** pass through the frozen ResNet50, which extracts feature maps
2. Those features pass through the custom Dense head layers
3. The `sigmoid` output produces 32 predictions (numbers between 0 and 1)

With 639 images at batch size 32: `steps_per_epoch = 639 // 32 = 20 steps` per epoch.

### Step 2: Loss Calculation

For each batch, the loss function (Focal Loss in the final model) compares the 32 predictions against the 32 true labels.

The `class_weight` parameter modifies this: cancerous samples (class 0) receive **8× higher loss** than non-cancerous samples (class 1), so misclassifying a cancerous scan costs 8× more than misclassifying a healthy scan.

### Step 3: Backpropagation and Weight Update

The `Adam` optimizer (`learning_rate=0.0001`) computes gradients and updates **only the trainable parameters** (the custom head layers). The frozen ResNet50 weights do not change.

Adam is an adaptive optimizer — it maintains per-parameter learning rates that adjust based on the history of gradients. Think of it as each weight having its own customized learning speed.

### Step 4: Validation Check

After all 20 training steps, the model evaluates on the 160 validation images (without updating weights). This produces `val_loss` and `val_accuracy`.

### Step 5: Callbacks Fire

Three callbacks monitor the validation results:

| Callback | What It Watches | What It Does |
|---|---|---|
| `EarlyStopping(patience=7)` | `val_loss` | If val_loss hasn't improved in 7 epochs, stop training and restore the best weights |
| `ReduceLROnPlateau(factor=0.3, patience=3)` | `val_loss` | If val_loss plateaus for 3 epochs, multiply learning rate by 0.3 (e.g., 0.001 → 0.0003) |
| `ModelCheckpoint('focal_loss_model.h5')` | `val_loss` | Saves the model weights whenever val_loss reaches a new minimum |

In the Focal Loss training run, `ReduceLROnPlateau` triggered twice:
- **Epoch 7:** learning rate reduced from `0.001` → `0.0003`
- **Epoch 19:** learning rate reduced from `0.0003` → `0.00009`

The training ran for all **20 epochs** (EarlyStopping did not trigger), with val_accuracy climbing from ~70% to **~87%** and val_loss dropping from ~0.07 to **~0.02**.

---

## Why Multiple .h5 Files Exist

The multiple `.h5` files are not duplicates — they are **snapshots from different experiments**, each trying to solve the class collapse problem. Here's the story:

### The Experimental Journey

| File | Size | Base Model | Strategy | Result |
|---|---|---|---|---|
| `best_lung_cancer_model.h5` | 17.8 MB | EfficientNetB0 | Standard `binary_crossentropy` with computed class weights (~2.83:1) | **Class collapse** — predicted all 200 test images as non-cancerous |
| `balanced_lung_cancer_model.h5` | 15.9 MB | EfficientNetB0 | Re-trained with balanced approach | Still struggled with cancerous detection |
| `best_lung_cancer_model_v2.h5` | 19.9 MB | EfficientNetB0 | Stronger class weights (`{0: 3.0, 1: 1.0}`) + heavier Dropout (0.5) + deeper custom head (Dense 512→256→64→1) | Some improvement but inadequate class separation |
| `aggressive_lung_cancer_model.h5` | 24.3 MB | EfficientNetB0 | Even more aggressive class weighting | Marginal improvement |
| `focal_loss_model.h5` | 96.5 MB | **ResNet50** | **Focal Loss** (`gamma=2.0, alpha=0.75`) + extreme class weights (`{0: 8.0, 1: 1.0}`) | **Breakthrough** — prediction range 0.42–0.96, genuine class separation |
| `PulmoCareAI_FocalLoss_Final.h5` | 92.4 MB | **ResNet50** | Same Focal Loss model, manually saved as final export | Same as above — this is the model for production |
| `PulmoCareAI_ResNet50_FocalLoss_<timestamp>.h5` | 92.4 MB | **ResNet50** | Timestamped version saved alongside metadata JSON | Same model, saved with metadata for full traceability |

**Key insight:** The size difference tells the story. The EfficientNetB0 models are 16-25 MB; the ResNet50 models are 92-96 MB. The switch from EfficientNetB0 to ResNet50 happened *because* the smaller architecture couldn't learn the minority class, even with aggressive class weights.

### What "Class Collapse" Looked Like

The v2 EfficientNetB0 model's test evaluation output said it all:
```
Classification Report:
              precision  recall  f1-score  support
  cancerous      0.00     0.00     0.00       52
non_cancerous    0.74     1.00     0.85      148

Model predicted class 0 count: 0
Model predicted class 1 count: 200
```

The model achieved **74% accuracy** by predicting **every single image** as non-cancerous. It had given up on detecting cancer entirely. This is the most dangerous failure mode in medical AI — a model that looks accurate but never sounds the alarm.

### What Fixed It

The combination of:
1. **ResNet50** (deeper, more powerful feature extraction than EfficientNetB0)
2. **Focal Loss** (penalizes confident-but-wrong predictions exponentially more)
3. **Extreme class weights** (8:1 ratio forcing the model to care about cancerous cases)

Produced predictions like:
```
Raw predictions: [0.9638, 0.9638, 0.7666, 0.8158, 0.7035, 0.8027,
                  0.4796, 0.9608, 0.8250, 0.7933, 0.9020, 0.9108,
                  0.4513, 0.9633, 0.5399, 0.7318, 0.4890, 0.7963,
                  0.7617, 0.4198]
Min: 0.4198, Max: 0.9638
Range: 0.5440
```

The predictions now **spread across a range** instead of collapsing to one value. At threshold 0.5, the model identifies 4 out of 20 test samples as cancerous — it's finally seeing both classes.

---

## What `lung_cancer_model_metadata.json` Stores

The metadata JSON is your model's **passport**. It tells the Flask app everything it needs to know to load and use the model correctly.

```python
model_metadata = {
    'version': 'ResNet50-FocalLoss-v1.0',
    'accuracy': float(max(history.history['val_accuracy'])),
    'test_accuracy': float(test_metrics.get('accuracy', 0.0)),
    'test_precision': float(test_metrics.get('precision', 0.0)),
    'test_recall': float(test_metrics.get('recall', 0.0)),
    'auc_score': float(auc_score),
    'epochs_trained': len(history.history['loss']),
    'batch_size': BATCH_SIZE,
    'training_duration_minutes': training_duration.total_seconds() / 60,
    'training_date': datetime.datetime.now().isoformat(),
    'dataset_info': {
        'total_samples': len(dataset_df),      # 999
        'training_samples': len(train_df),     # 639
        'validation_samples': len(val_df),     # 160
        'test_samples': len(test_df)           # 200
    },
    'model_architecture': 'ResNet50 + Focal Loss + Custom Head',
    'input_shape': [224, 224, 3],
    'classes': ['cancerous', 'non_cancerous'],
    'class_indices': train_generator.class_indices,  # {'cancerous': 0, 'non_cancerous': 1}
    'training_approach': 'Focal Loss with extreme class weights (8:1)',
    'notes': 'Successfully achieved class separation with prediction range 0.54'
}
```

### Why Stage 2 Needs This File

The Flask app (Stage 2) needs to answer three critical questions when loading the model:

| Question | Metadata Field That Answers It |
|---|---|
| What image size does the model expect? | `input_shape: [224, 224, 3]` — images must be resized to 224×224 pixels with 3 color channels |
| What does the model's output *mean*? | `class_indices: {'cancerous': 0, 'non_cancerous': 1}` — if the sigmoid output is < 0.5, the prediction is **cancerous**; if > 0.5, **non-cancerous** |
| What classes does the model know? | `classes: ['cancerous', 'non_cancerous']` — the model is binary; it only knows these two categories |

Without `class_indices`, Stage 2 would have no way of knowing whether a sigmoid output of 0.9 means "90% cancerous" or "90% non-cancerous." Getting this wrong would be catastrophic — the app would tell healthy patients they have cancer and tell cancer patients they're fine.

The performance metrics (`accuracy`, `test_precision`, `test_recall`, `auc_score`) let Stage 2 display confidence information and are used for clinical transparency — radiologists need to know the model's proven accuracy before they trust its output.

---

## What This Stage Passes Forward

Everything Stage 2 (the Flask web app) needs to function is produced here:

| File | What It Contains | What Stage 2 Does With It |
|---|---|---|
| `PulmoCareAI_FocalLoss_Final.h5` | The trained ResNet50 model — 25+ million parameters, frozen in HDF5 format | The Flask app loads this with `tf.keras.models.load_model()` to make predictions on new CT scans |
| `lung_cancer_model_metadata.json` | Model version, performance metrics, class mappings, input specifications | The Flask app reads this to know how to preprocess images (resize to 224×224), interpret the sigmoid output, and display accuracy statistics |
| `focal_loss_model.h5` | ModelCheckpoint's best weights (same model, saved automatically during training) | Backup model file — same architecture, saved at the epoch with lowest `val_loss` |

### The Handoff

The `.h5` file goes into the Flask app's `static/models/` directory. The metadata JSON is read at app startup. Together, they turn the Flask app from an empty shell into a functioning cancer detection system.

Without these files, Stage 2 is just a web page with an upload button that does nothing.
