import React, { useState, useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { CONFIG } from './config';

type Prediction = cocoSsd.DetectedObject;

const App: React.FC = () => {
    const [status, setStatus] = useState<string>('AIモデルを読み込んでいます...');
    const [error, setError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
    const detectionIntervalRef = useRef<number | null>(null);

    // Function to draw predictions on the canvas
    const drawPredictions = (predictions: Prediction[]) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !video) return;

        // Ensure canvas matches video display size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = CONFIG.detection.colors.box;
        ctx.lineWidth = CONFIG.drawing.lineWidth;
        ctx.font = CONFIG.drawing.font;
        ctx.fillStyle = CONFIG.detection.colors.text;

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeRect(x, y, width, height);
            const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            const textY = y > 10 ? y - 5 : 10;
            ctx.fillText(label, x, textY);
        });
    };

    // Function to run object detection continuously
    const runDetection = async () => {
        if (!modelRef.current || !videoRef.current || videoRef.current.readyState < 3) return;
        
        try {
            const predictions = await modelRef.current.detect(videoRef.current);
            const filteredPredictions = predictions.filter(
                (pred: Prediction) => pred.score >= CONFIG.detection.minScore
            );
            drawPredictions(filteredPredictions);
        } catch (err) {
            console.error('Detection error:', err);
            setError('An error occurred during detection.');
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        }
    };

    // Initialization effect hook
    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const initialize = async () => {
            try {
                setStatus('Loading AI model...');
                modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });

                setStatus('Initializing camera...');
                stream = await navigator.mediaDevices.getUserMedia({ video: CONFIG.camera });
                
                const video = videoRef.current;
                if (!video) return;

                video.srcObject = stream;
                await new Promise<void>((resolve) => {
                    video.onloadedmetadata = () => {
                        video.play();
                        const canvas = canvasRef.current;
                        if(canvas) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                        }
                        resolve();
                    };
                });
                
                setStatus('Ready');
                detectionIntervalRef.current = window.setInterval(runDetection, CONFIG.detection.interval);
                setTimeout(() => setStatus(''), 3000);

            } catch (err: any) {
                console.error('Initialization failed:', err);
                
                // より詳細なエラーメッセージを表示
                if (err.name === 'NotAllowedError') {
                    setError('Camera access was denied. Please allow camera permissions.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found. Please connect a camera device.');
                } else if (err.name === 'NotReadableError') {
                    setError('Camera is already in use by another application.');
                } else if (err.name === 'OverconstrainedError') {
                    setError('Camera does not support the required settings.');
                } else if (err.name === 'SecurityError') {
                    setError('Camera access blocked. Please use HTTPS or localhost.');
                } else {
                    setError(`Initialization failed: ${err.message || 'Unknown error'}. Please reload the page.`);
                }
                setStatus('');
            }
        };

        initialize();

        // Cleanup function
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
            <header className="bg-blue-500 text-white p-4 text-center shadow-md">
                <h1 className="text-2xl md:text-3xl font-bold">みまもりAI</h1>
                <p className="mt-1 text-sm md:text-base opacity-90">AIによるリアルタイム物体検出</p>
            </header>

            <main className="flex-grow flex flex-col items-center p-4 md:p-8 gap-4">
                <div className="bg-white p-2 md:p-4 rounded-lg shadow-lg relative inline-block">
                    <div className="relative inline-block">
                        <video
                            id="video"
                            ref={videoRef}
                            width={CONFIG.camera.width}
                            height={CONFIG.camera.height}
                            autoPlay
                            playsInline
                            muted
                            className="rounded-md block"
                        ></video>
                        <canvas 
                            id="canvas" 
                            ref={canvasRef}
                            className="absolute top-0 left-0 rounded-md pointer-events-none"
                        ></canvas>
                    </div>
                </div>
                {status && <div className="p-2 px-4 rounded-md bg-white text-gray-800">{status}</div>}
                {error && <div className="p-2 px-4 rounded-md bg-red-500 text-white">{error}</div>}
            </main>

            <footer className="text-center p-4 bg-white text-gray-700 shadow-inner">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm">
                    <div>
                        <p>
                            <i className="fas fa-shield-alt mr-2"></i>
                            Privacy: Camera footage is processed locally and never sent to a server.
                        </p>
                    </div>
                    <div>
                        <p>
                            Powered by
                            <a href="https://www.tensorflow.org/js" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">TensorFlow.js</a> &
                            <a href="https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">COCO-SSD</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;