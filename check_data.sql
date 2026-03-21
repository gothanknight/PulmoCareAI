-- Query to check all patient data
SELECT * FROM patient;

-- Query to check all prediction data (basic info)
SELECT 
    id,
    patient_id,
    result,
    confidence,
    image_path,
    created_at,
    CASE 
        WHEN gradcam_image IS NOT NULL THEN 'YES' 
        ELSE 'NO' 
    END as has_gradcam
FROM prediction;

-- Query to count records
SELECT 
    'Patients' as table_name, 
    COUNT(*) as total_records 
FROM patient
UNION ALL
SELECT 
    'Predictions' as table_name, 
    COUNT(*) as total_records 
FROM prediction;