import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const NeuralNetworkVisualization = () => {
  const svgRef = useRef();
  const [hoveredNeuron, setHoveredNeuron] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activationPattern, setActivationPattern] = useState({});

  // Circular Neural Network Architecture (YouTube Style)
  const networkData = {
    metadata: {
      version: "ResNet50-FocalLoss-v1.0",
      accuracy: 86.87,
      auc_score: 99.56,
      input_shape: [224, 224, 3],
      classes: ["cancerous", "non_cancerous"],
      training_approach: "Focal Loss with extreme class weights (8:1)"
    },
    layers: [
      {
        id: 'input',
        name: 'Input',
        type: 'input',
        neurons: 3, // RGB channels simplified
        description: 'CT Scan Input',
        details: 'Preprocessed lung CT scan images with RGB channels',
        color: '#4F46E5',
        x: 140
      },
      {
        id: 'conv1',
        name: 'Conv Block 1',
        type: 'convolution',
        neurons: 8,
        description: 'Initial Feature Detection',
        details: 'First convolutional layers (7×7, 64 filters)',
        color: '#DC2626',
        x: 290
      },
      {
        id: 'conv2',
        name: 'Conv Block 2',
        type: 'convolution',
        neurons: 12,
        description: 'Low-level Features',
        details: 'ResNet blocks (64→256 channels)',
        color: '#DC2626',
        x: 440
      },
      {
        id: 'conv3',
        name: 'Conv Block 3',
        type: 'convolution',
        neurons: 16,
        description: 'Mid-level Features',
        details: 'ResNet blocks (128→512 channels)',
        color: '#DC2626',
        x: 590
      },
      {
        id: 'conv4',
        name: 'Conv Block 4',
        type: 'convolution',
        neurons: 20,
        description: 'High-level',
        details: 'ResNet blocks (256→1024 channels)',
        color: '#DC2626',
        x: 740
      },
      {
        id: 'conv5',
        name: 'Conv Block 5',
        type: 'convolution',
        neurons: 16,
        description: 'Abstract Features',
        details: 'Final ResNet blocks (512→2048 channels)',
        color: '#DC2626',
        x: 890
      },
      {
        id: 'pool',
        name: 'Global Pooling',
        type: 'pooling',
        neurons: 8,
        description: 'Feature Compression',
        details: 'Global Average Pooling (7×7×2048 → 2048)',
        color: '#059669',
        x: 1040
      },
      {
        id: 'dense1',
        name: 'Dense Layer',
        type: 'dense',
        neurons: 6,
        description: 'Feature Learning',
        details: 'Fully connected (256 neurons, ReLU)',
        color: '#0891B2',
        x: 1190
      },
      {
        id: 'output',
        name: 'Output',
        type: 'output',
        neurons: 2,
        description: 'Prediction',
        details: 'Binary classification (Cancerous/Non-cancerous)',
        color: '#EA580C',
        x: 1340
      }
    ]
  };

  // Generate random activation patterns
  const generateActivationPattern = () => {
    const pattern = {};
    networkData.layers.forEach(layer => {
      pattern[layer.id] = [];
      for (let i = 0; i < layer.neurons; i++) {
        pattern[layer.id].push(Math.random());
      }
    });
    return pattern;
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1400;
    const height = 800; // Even larger for better visibility
    const centerY = height / 2;
    
    svg.attr("width", width).attr("height", height);

    // Create gradient definitions for neuron activation
    const defs = svg.append("defs");
    
    // Activation gradient (cold to hot)
    const activationGradient = defs.append("radialGradient")
      .attr("id", "activationGradient");
    
    activationGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FEF3C7")
      .attr("stop-opacity", 1);
    
    activationGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.8);

    // Low activation gradient
    const lowActivationGradient = defs.append("radialGradient")
      .attr("id", "lowActivationGradient");
    
    lowActivationGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#DBEAFE")
      .attr("stop-opacity", 1);
    
    lowActivationGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.6);

    // Connection lines group
    const connections = svg.append("g").attr("class", "connections");
    
    // Neurons group
    const neurons = svg.append("g").attr("class", "neurons");

    // Calculate neuron positions for each layer with optimized spacing
    const neuronPositions = {};
    const maxNeurons = Math.max(...networkData.layers.map(l => l.neurons));
    const topMargin = 100; // Optimized space for top labels
    const bottomMargin = 120; // More space for bottom labels
    const availableHeight = height - topMargin - bottomMargin;
    
    networkData.layers.forEach(layer => {
      neuronPositions[layer.id] = [];
      // Calculate spacing based on available height and number of neurons
      const neuronSpacing = Math.max(30, availableHeight / Math.max(layer.neurons + 1, 1));
      const totalNeuronHeight = (layer.neurons - 1) * neuronSpacing;
      const startY = topMargin + (availableHeight - totalNeuronHeight) / 2;
      
      for (let i = 0; i < layer.neurons; i++) {
        neuronPositions[layer.id].push({
          x: layer.x,
          y: startY + (i * neuronSpacing),
          id: `${layer.id}_${i}`,
          layerId: layer.id,
          neuronIndex: i,
          activation: Math.random() // Initial random activation
        });
      }
    });

    // Draw connections between all neurons in adjacent layers
    for (let layerIndex = 0; layerIndex < networkData.layers.length - 1; layerIndex++) {
      const currentLayer = networkData.layers[layerIndex];
      const nextLayer = networkData.layers[layerIndex + 1];
      
      const currentNeurons = neuronPositions[currentLayer.id];
      const nextNeurons = neuronPositions[nextLayer.id];
      
      currentNeurons.forEach(fromNeuron => {
        nextNeurons.forEach(toNeuron => {
          const weight = Math.random() * 0.8 + 0.2; // Random weight between 0.2 and 1.0
          
          const line = connections.append("line")
            .attr("x1", fromNeuron.x)
            .attr("y1", fromNeuron.y)
            .attr("x2", toNeuron.x)
            .attr("y2", toNeuron.y)
            .attr("stroke", "#E5E7EB")
            .attr("stroke-width", weight * 2)
            .attr("opacity", 0.3)
            .attr("class", `connection-${fromNeuron.id}-${toNeuron.id}`);
        });
      });
    }

    // Draw neurons
    Object.entries(neuronPositions).forEach(([layerId, layerNeurons]) => {
      const layer = networkData.layers.find(l => l.id === layerId);
      
      layerNeurons.forEach(neuron => {
        const neuronGroup = neurons.append("g")
          .attr("class", "neuron-group")
          .attr("transform", `translate(${neuron.x}, ${neuron.y})`);

        // Neuron circle
        const circle = neuronGroup.append("circle")
          .attr("r", 12)
          .attr("fill", neuron.activation > 0.6 ? "url(#activationGradient)" : "url(#lowActivationGradient)")
          .attr("stroke", layer.color)
          .attr("stroke-width", 2)
          .attr("opacity", 0.9)
          .style("cursor", "pointer")
          .attr("class", `neuron-${neuron.id}`);

        // Activation level indicator (inner glow)
        neuronGroup.append("circle")
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", "#FFFFFF")
          .attr("stroke-width", neuron.activation > 0.7 ? 2 : 0)
          .attr("opacity", neuron.activation);

        // Hover and click effects
        neuronGroup
          .on("mouseenter", function() {
            setHoveredNeuron({
              ...neuron,
              layer: layer,
              activation: neuron.activation
            });
            
            // Highlight neuron
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("r", 16)
              .attr("stroke-width", 3);

            // Highlight connected weights
            connections.selectAll(`[class*="${neuron.id}"]`)
              .transition()
              .duration(200)
              .attr("opacity", 0.8)
              .attr("stroke", "#F59E0B");
          })
          .on("mouseleave", function() {
            setHoveredNeuron(null);
            
            // Reset neuron
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("r", 12)
              .attr("stroke-width", 2);

            // Reset connections
            connections.selectAll(`[class*="${neuron.id}"]`)
              .transition()
              .duration(200)
              .attr("opacity", 0.3)
              .attr("stroke", "#E5E7EB");
          })
          .on("click", function() {
            // Trigger activation wave
            triggerActivationWave(neuron, layerId);
          });
      });
    });

    // Add layer labels with compact but clear spacing
    networkData.layers.forEach((layer, index) => {
      // Top labels - layer name with better spacing
      svg.append("text")
        .attr("x", layer.x)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .attr("fill", layer.color)
        .text(layer.name);

      // Top labels - description (compact)
      const description = layer.description;
      const maxChars = 15; // Reduced for better fit
      
      if (description.length > maxChars) {
        const words = description.split(' ');
        if (words.length >= 2) {
          const midPoint = Math.ceil(words.length / 2);
          const line1 = words.slice(0, midPoint).join(' ');
          const line2 = words.slice(midPoint).join(' ');
          
          svg.append("text")
            .attr("x", layer.x)
            .attr("y", 47)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#6B7280")
            .text(line1);
            
          svg.append("text")
            .attr("x", layer.x)
            .attr("y", 62)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#6B7280")
            .text(line2);
        } else {
          svg.append("text")
            .attr("x", layer.x)
            .attr("y", 47)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#6B7280")
            .text(description.substring(0, maxChars) + "...");
        }
      } else {
        svg.append("text")
          .attr("x", layer.x)
          .attr("y", 47)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", "#6B7280")
          .text(description);
      }

      // Bottom labels - improved spacing for all layers
      const bottomStartY = height - 90;
      
      svg.append("text")
        .attr("x", layer.x)
        .attr("y", bottomStartY)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "#9CA3AF")
        .text(`${layer.neurons} neurons`);
        
      svg.append("text")
        .attr("x", layer.x)
        .attr("y", bottomStartY + 18)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#9CA3AF")
        .text(layer.type);
    });

    // Add performance metrics with compact positioning
    const metricsGroup = svg.append("g").attr("transform", `translate(60, ${height - 30})`);
    
    const metrics = [
      `Accuracy: ${networkData.metadata.accuracy}%`,
      `AUC Score: ${networkData.metadata.auc_score}%`,
      `Training: ${networkData.metadata.training_approach}`,
      `Classes: ${networkData.metadata.classes.join(' vs ')}`
    ];

    metrics.forEach((metric, i) => {
      metricsGroup.append("text")
        .attr("x", i * 260) // Closer spacing for compact layout
        .attr("y", 0)
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .attr("fill", "#374151")
        .text(metric);
    });

    // Auto-activation animation
    const startAutoActivation = () => {
      setInterval(() => {
        const randomLayerId = networkData.layers[Math.floor(Math.random() * networkData.layers.length)].id;
        const layerNeurons = neuronPositions[randomLayerId];
        const randomNeuron = layerNeurons[Math.floor(Math.random() * layerNeurons.length)];
        triggerActivationWave(randomNeuron, randomLayerId);
      }, 3000);
    };

    setTimeout(startAutoActivation, 2000);

  }, []);

  // Trigger activation wave animation
  const triggerActivationWave = (startNeuron, layerId) => {
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    
    // Pulse the clicked neuron
    svg.select(`.neuron-${startNeuron.id}`)
      .transition()
      .duration(300)
      .attr("r", 20)
      .attr("stroke-width", 4)
      .transition()
      .duration(300)
      .attr("r", 12)
      .attr("stroke-width", 2)
      .on("end", () => setIsAnimating(false));

    // Create ripple effect
    const ripple = svg.append("circle")
      .attr("cx", startNeuron.x)
      .attr("cy", startNeuron.y)
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("opacity", 1);

    ripple
      .transition()
      .duration(1000)
      .attr("r", 60)
      .attr("opacity", 0)
      .remove();

    // Activate connected neurons with delay
    setTimeout(() => {
      const currentLayerIndex = networkData.layers.findIndex(l => l.id === layerId);
      if (currentLayerIndex < networkData.layers.length - 1) {
        const nextLayer = networkData.layers[currentLayerIndex + 1];
        svg.selectAll(`.neuron-group`)
          .filter(function() {
            return d3.select(this).select("circle").attr("class")?.includes(nextLayer.id);
          })
          .select("circle")
          .transition()
          .duration(200)
          .attr("fill", "url(#activationGradient)")
          .transition()
          .delay(500)
          .duration(500)
          .attr("fill", d => Math.random() > 0.6 ? "url(#activationGradient)" : "url(#lowActivationGradient)");
      }
    }, 300);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Interactive Neural Network (ResNet50 + Focal Loss)
        </h3>
        <p className="text-gray-600">
          Hover over neurons to see details • Click neurons to trigger activation waves • Watch auto-activation patterns
        </p>
      </div>
      
      <div className="relative overflow-x-auto">
        <svg 
          ref={svgRef} 
          className="border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
          width="1400"
          height="800"
        ></svg>
        
        {/* Neuron hover tooltip */}
        {hoveredNeuron && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-10"
          >
            <h4 className="font-bold text-gray-900 mb-2">
              {hoveredNeuron.layer.name} - Neuron #{hoveredNeuron.neuronIndex + 1}
            </h4>
            <p className="text-sm text-gray-600 mb-2">{hoveredNeuron.layer.details}</p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Activation Level:</span>
                <span className={`font-bold ${hoveredNeuron.activation > 0.6 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {(hoveredNeuron.activation * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-semibold ${hoveredNeuron.activation > 0.6 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {hoveredNeuron.activation > 0.7 ? 'Highly Active' : 
                   hoveredNeuron.activation > 0.4 ? 'Moderately Active' : 'Low Activity'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Layer Type:</span>
                <span className="font-semibold text-gray-700 capitalize">{hoveredNeuron.layer.type}</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <strong>Click to trigger activation wave</strong> and see how this neuron influences the next layer
            </div>
          </motion.div>
        )}
      </div>

      {/* Activation Legend */}
      <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-200 to-orange-500 rounded-full mr-2"></div>
          <span>High Activation</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-200 to-blue-500 rounded-full mr-2"></div>
          <span>Low Activation</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-orange-500 rounded-full mr-2"></div>
          <span>Neuron Connections</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <span>Weight Connections</span>
        </div>
      </div>

      {/* Interactive Instructions */}
      <div className="mt-4 md:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4">
        <h4 className="font-bold text-gray-900 mb-2 text-sm md:text-base">🧠 Interactive Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm text-gray-700">
          <div>
            <strong className="text-blue-600">Hover:</strong> See individual neuron activation levels and layer details
          </div>
          <div>
            <strong className="text-orange-600">Click:</strong> Trigger activation waves to see information flow
          </div>
          <div>
            <strong className="text-green-600">Auto-mode:</strong> Watch automatic activation patterns every 3 seconds
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-4 md:mt-6 bg-gray-50 rounded-lg p-3 md:p-4">
        <h4 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Neural Network Specifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
          <div>
            <strong>Architecture:</strong> ResNet50 + Focal Loss + Custom Head
          </div>
          <div>
            <strong>Training Approach:</strong> {networkData.metadata.training_approach}
          </div>
          <div>
            <strong>Total Layers:</strong> {networkData.layers.length} functional layers
          </div>
          <div>
            <strong>Activation Function:</strong> ReLU (hidden), Sigmoid (output)
          </div>
          <div>
            <strong>Input Resolution:</strong> 224×224×3 (RGB CT Scans)
          </div>
          <div>
            <strong>Output Classes:</strong> {networkData.metadata.classes.join(' vs ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualization;