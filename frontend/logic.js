let count = 0;
 
const regionOptions = {

      aws: ["us-east-1", "us-west-2", "eu-central-1"],

      azure: ["eastus", "westeurope", "southeastasia"],

      gcp: ["us-central1", "europe-west1", "asia-east1"],

      vm: ["local", "remote"],

      custom: ["custom-region"]

};
 


  function addDestination() {
  const id = count++;
  const container = document.getElementById("destinationContainer");

  const wrapper = document.createElement("div");
  wrapper.className = "bg-white p-4 rounded shadow space-y-3";

  wrapper.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium">Name *</label>
        <input type="text" name="name" required class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Type *</label>
        <select name="type" required onchange="updateRegionOptions(this, ${id})" class="w-full border rounded px-3 py-2">
          <option value="">Select</option>
          <option value="aws">AWS</option>
          <option value="azure">Azure</option>
          <option value="gcp">GCP</option>
          <option value="vm">VM (SSH)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium">Region *</label>
        <select name="region" id="region-${id}" required class="w-full border rounded px-3 py-2">
          <option value="">Select a type first</option>
        </select>
      </div>

      <div class="ip-field hidden">
        <label class="block text-sm font-medium">IP Address *</label>
        <input type="text" name="ip" class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Username *</label>
        <input type="text" name="username" required class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Password *</label>
        <input type="password" name="password" required class="w-full border rounded px-3 py-2" />
      </div>
    </div>

    <button type="button" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onclick="testConnection(this)">
      Test Connection
    </button>
  `;

  container.appendChild(wrapper);
}


 
  function updateRegionOptions(select, id) {
  const type = select.value;
  const regionSelect = document.getElementById(`region-${id}`);
  regionSelect.innerHTML = "";

  // Populate region options
  if (regionOptions[type]) {
    regionOptions[type].forEach(region => {
      const opt = document.createElement("option");
      opt.value = region;
      opt.text = region;
      regionSelect.add(opt);
    });
  } else {
    regionSelect.innerHTML = "<option value=''>No regions available</option>";
  }

  // Show or hide IP address field based on type
  const wrapper = select.closest("div").parentElement.parentElement;
  const ipField = wrapper.querySelector(".ip-field");

  if (type === "vm" || type === "custom") {
    ipField.classList.remove("hidden");
    ipField.querySelector("input").setAttribute("required", "true");
  } else {
    ipField.classList.add("hidden");
    ipField.querySelector("input").removeAttribute("required");
  }
}


 
  function testConnection(button) {
  const wrapper = button.closest("div");
  const name = wrapper.querySelector("input[name='name']").value;
  const type = wrapper.querySelector("select[name='type']").value;
  const region = wrapper.querySelector("select[name='region']").value;
  const username = wrapper.querySelector("input[name='username']").value;
  const password = wrapper.querySelector("input[name='password']").value;
  const ipField = wrapper.querySelector("input[name='ip']");

  if (!name || !type || !region || !username || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  if ((type === "vm" || type === "custom") && (!ipField || !ipField.value.trim())) {
    alert("Please provide IP address for VM or Custom types.");
    return;
  }

  alert(`Testing connection for ${name} (${type} - ${region}) with Username: ${username}${ipField && ipField.value ? `, IP: ${ipField.value}` : ""}`);
}



document.getElementById("destinationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const wrappers = document.querySelectorAll("#destinationContainer > div");
  const appId = "app_12345678"; 

  const destinations = [];

  for (const wrapper of wrappers) {
    const name = wrapper.querySelector("input[name='name']").value.trim();
    const type = wrapper.querySelector("select[name='type']").value.trim();
    const region = wrapper.querySelector("select[name='region']").value.trim();
    const ip = wrapper.querySelector("input[name='ip']").value.trim();
    const username = wrapper.querySelector("input[name='username']").value.trim();
    const password = wrapper.querySelector("input[name='password']").value.trim();

    // Optional defaults
    const port = 22;
    const base_path = "/default/path";

    // Validation
    if (!name || !type || !region || !username || !password || (["vm", "custom"].includes(type.toLowerCase()) && !ip)) {
      alert("Please fill in all required fields.");
      return;
    }

    destinations.push({
    name,
    type: type.toUpperCase(),  
    region,
    config: { ip, port, username, password, base_path }
  });


    try {
      const res = await fetch(`http://localhost:8000/app/${appId}/destinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(destinations)
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error response:", error);
        alert(`Error submitting destination: ${error.detail || "Unknown error"}`);
        return;
      }

      console.log("Destination submitted successfully");
    } catch (err) {
      alert("Network error: " + err.message);
      return;
    }
  }

  alert("All destinations submitted successfully!");
});
