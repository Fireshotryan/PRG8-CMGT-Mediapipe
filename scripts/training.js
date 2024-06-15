// Define an empty array to store the pose data
const poseData = [];

// Fetch the JSON file containing pose data
fetch('../scripts/trainable.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(jsondata => {
    // Iterate through the JSON data and extract pose data with the correct length
    for (const item of jsondata) {
      if (item.pose.length === 18) {
        poseData.push(item);
      } else {
        console.log(`Data does not have the correct length: ${item.label}`);
      }
    }

    // Define the training data array
    const trainingData = poseData.map(item => ({
      pose: item.pose,
      label: item.label
    }));

    // Initialize the neural network
    const nn = ml5.neuralNetwork({ task: 'classification', debug: true });

    // Add training data to the neural network
    trainingData.forEach(item => {
      nn.addData(item.pose, { label: item.label });
    });

    // Function to start training
    function startTraining() {
      // Normalize the data
      nn.normalizeData();

      // Train the neural network
      nn.train({ epochs: 10 }, () => finishedTraining());
    }

    // Callback function for when training is finished
    async function finishedTraining() {
      console.log("Finished training!");
      // Save the trained model
      nn.save("model", () => console.log("Model was saved!"));
    }

    // Start training
    startTraining();
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
