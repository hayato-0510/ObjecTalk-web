export const CONFIG = {
    // Detection settings
    detection: {
        interval: 200,  // Detection interval in milliseconds
        minScore: 0.5,  // Minimum confidence score
        colors: {
            box: '#00ff00',  // Bounding box color
            text: '#00ff00'  // Text color
        }
    },
    
    // Drawing settings
    drawing: {
        font: '16px "Helvetica Neue", Arial, sans-serif',
        lineWidth: 2
    },
    
    // Camera settings
    camera: {
        width: 640,
        height: 480,
        facingMode: 'environment' as const // Prioritize rear camera
    }
};