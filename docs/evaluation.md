# Automated AI Evaluation & Groundedness Benchmark Framework

## Evaluation Methodology

The platform includes an automated evaluation framework to measure the precision, recall, accuracy, and evidence-groundedness of AI recruitment intelligence operations against real-world candidate data.

The benchmark suite runs against a documented 50+ resume-job dataset ([`data/benchmark_dataset.json`](file:///d:/project/ai-resume-&-ats-analyzer/data/benchmark_dataset.json)).

---

## Benchmark Metrics & Formulas

### 1. Skill Extraction F1 Score
Evaluates the engine's capability to extract technical skills accurately without false positives.

$$\text{Precision} = \frac{\text{True Extracted Skills}}{\text{Total Extracted Skills}}$$

$$\text{Recall} = \frac{\text{True Extracted Skills}}{\text{Total Ground-Truth Skills}}$$

$$\text{F1 Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### 2. Candidate Match Fit Accuracy F1
Measures the alignment between candidate experiences and target job requirements across the benchmark dataset.

### 3. Mean Absolute Error (MAE)
Quantifies score deviation between deterministic ATS algorithm predictions and human recruiter baseline scores:

$$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |S_i^{\text{predicted}} - S_i^{\text{actual}}|$$

### 4. Evidence Groundedness Verification Rate
Measures the percentage of AI-generated recommendation claims supported by verifiable evidence in raw resume text.

$$\text{Groundedness \%} = \frac{\text{Supported Claims} + \text{Inferred Claims}}{\text{Total Generated Recommendation Claims}} \times 100$$

---

## Reproducibility Guarantee
- **Zero Fabrication**: All benchmark runs execute real document parsing, skill taxonomy extraction, vector semantic matching, and evidence verification without mock data or simulated scores.
