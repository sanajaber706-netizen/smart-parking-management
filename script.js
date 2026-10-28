const initialSlots = [
  { id: 'A1', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A2', floor: 'ground', status: 'occupied', vehicle: 'KA 01 AB 1234', entryTime: '08:15', rate: '$5/hr' },
  { id: 'A3', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A4', floor: 'ground', status: 'occupied', vehicle: 'KA 05 TY 4012', entryTime: '09:10', rate: '$5/hr' },
  { id: 'A5', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A6', floor: 'ground', status: 'occupied', vehicle: 'KA 09 ML 8891', entryTime: '10:40', rate: '$5/hr' },
  { id: 'A7', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A8', floor: 'ground', status: 'occupied', vehicle: 'KA 12 AZ 2308', entryTime: '11:02', rate: '$5/hr' },
  { id: 'A9', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A10', floor: 'ground', status: 'occupied', vehicle: 'KA 16 PQ 4490', entryTime: '12:15', rate: '$5/hr' },
  { id: 'A11', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A12', floor: 'ground', status: 'occupied', vehicle: 'KA 22 RC 1765', entryTime: '12:50', rate: '$5/hr' },
  { id: 'B1', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B2', floor: 'upper', status: 'occupied', vehicle: 'KA 48 LJ 4045', entryTime: '08:30', rate: '$7/hr' },
  { id: 'B3', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B4', floor: 'upper', status: 'occupied', vehicle: 'KA 66 XM 3009', entryTime: '09:45', rate: '$7/hr' },
  { id: 'B5', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B6', floor: 'upper', status: 'occupied', vehicle: 'KA 74 HF 1188', entryTime: '11:28', rate: '$7/hr' },
  { id: 'B7', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B8', floor: 'upper', status: 'occupied', vehicle: 'KA 82 NZ 5527', entryTime: '13:00', rate: '$7/hr' },
];

const activityList = [
  'KA 01 AB 1234 entered at 08:15',
  'KA 05 TY 4012 checked in at 09:10',
  'KA 48 LJ 4045 parked on upper floor',
  'A1 was cleared and made available',
  'Peak occupancy reached 72% today'
];

let slots = [...initialSlots];
let selectedSlotId = 'A1';

const totalSlotsEl = document.getElementById('totalSlots');
const availableSlotsEl = document.getElementById('availableSlots');
const occupiedSlotsEl = document.getElementById('occupiedSlots');
const revenueValueEl = document.getElementById('revenueValue');
const selectedSlotTitleEl = document.getElementById('selectedSlotTitle');
const slotStatusEl = document.getElementById('slotStatus');
const slotVehicleEl = document.getElementById('slotVehicle');
const slotEntryEl = document.getElementById('slotEntry');
const slotRateEl = document.getElementById('slotRate');
const toggleSlotBtn = document.getElementById('toggleSlotBtn');
const resetSlotBtn = document.getElementById('resetSlotBtn');
const activityListEl = document.getElementById('activityList');
const todayDateEl = document.getElementById('todayDate');
const todayTimeEl = document.getElementById('todayTime');
const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleDialog = document.getElementById('vehicleDialog');
const vehicleForm = document.getElementById('vehicleForm');
const vehiclePlateEl = document.getElementById('vehiclePlate');
const vehicleSlotEl = document.getElementById('vehicleSlot');
const vehicleFormMessageEl = document.getElementById('vehicleFormMessage');
const saveVehicleBtn = document.getElementById('saveVehicleBtn');
const statusMessageEl = document.getElementById('statusMessage');
let statusMessageTimeout;

async function loadSlotsFromSupabase() {
  if (!window.supabaseClient || !window.isSupabaseConfigured()) return null;

  const { data, error } = await window.supabaseClient
    .from('parking_slots')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Supabase load error:', error);
    return null;
  }

  return data;
}

async function loadSlots() {
  try {
    const supabaseData = await loadSlotsFromSupabase();
    if (supabaseData && supabaseData.length) {
      slots = supabaseData.map((slot) => ({
        id: slot.id,
        floor: slot.floor,
        status: slot.status,
        vehicle: slot.vehicle || '',
        entryTime: slot.entry_time || '',
        rate: slot.rate || '$5/hr'
      }));
      render();
      return;
    }

    const response = await fetch('/api/slots');
    if (!response.ok) throw new Error('Failed to load slots');
    const data = await response.json();
    slots = data;
    render();
  } catch (error) {
    slots = [...initialSlots];
    render();
    showStatusMessage('Could not load live parking data. Showing sample data instead.', true);
    console.error('Parking data load failed:', error);
  }
}

function getSelectedSlot() {
  return slots.find((slot) => slot.id === selectedSlotId);
}

function renderActivity() {
  const items = activityList.slice(0, 5).map((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    return listItem;
  });
  activityListEl.replaceChildren(...items);
}

function showStatusMessage(message, isError = false) {
  window.clearTimeout(statusMessageTimeout);
  statusMessageEl.textContent = message;
  statusMessageEl.classList.toggle('error', isError);
  statusMessageEl.hidden = false;
  statusMessageTimeout = window.setTimeout(() => {
    statusMessageEl.hidden = true;
  }, 4500);
}

function updateClock() {
  const now = new Date();
  todayDateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  todayTimeEl.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStats() {
  const total = slots.length;
  const occupied = slots.filter((slot) => slot.status === 'occupied').length;
  const available = total - occupied;
  const revenue = occupied * 12 + available * 2;

  totalSlotsEl.textContent = total;
  availableSlotsEl.textContent = available;
  occupiedSlotsEl.textContent = occupied;
  revenueValueEl.textContent = `$${revenue}`;
}

function renderSlotGrid(containerId, floorName) {
  const container = document.getElementById(containerId);
  const floorSlots = slots.filter((slot) => slot.floor === floorName);
  const buttons = floorSlots.map((slot) => {
    const isOccupied = slot.status === 'occupied';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `slot ${isOccupied ? 'occupied' : 'free'}${slot.id === selectedSlotId ? ' selected' : ''}`;
    button.dataset.slotId = slot.id;
    button.setAttribute('aria-pressed', String(slot.id === selectedSlotId));
    button.setAttribute('aria-label', `${slot.id}, ${isOccupied ? 'occupied' : 'available'}${slot.vehicle ? ` by ${slot.vehicle}` : ''}`);

    const tag = document.createElement('span');
    tag.className = 'slot-tag';
    tag.textContent = isOccupied ? 'Occupied' : 'Available';

    const name = document.createElement('span');
    name.className = 'slot-name';
    name.textContent = slot.id;

    const meta = document.createElement('span');
    meta.className = 'slot-meta';
    const vehicle = document.createElement('span');
    vehicle.textContent = slot.vehicle || 'Parking space';
    const entryTime = document.createElement('span');
    entryTime.textContent = slot.entryTime || slot.rate;
    meta.append(vehicle, entryTime);

    button.append(tag, name, meta);
    button.addEventListener('click', () => {
      selectedSlotId = button.dataset.slotId;
      render();
    });
    return button;
  });
  container.replaceChildren(...buttons);
}

function renderDetailPanel() {
  const slot = getSelectedSlot();
  if (!slot) return;

  const isOccupied = slot.status === 'occupied';
  selectedSlotTitleEl.textContent = `Slot ${slot.id}`;
  slotStatusEl.textContent = isOccupied ? 'Occupied' : 'Available';
  slotStatusEl.className = isOccupied ? 'status-value occupied' : 'status-value free';
  slotVehicleEl.textContent = slot.vehicle || 'Not assigned';
  slotEntryEl.textContent = slot.entryTime || 'Not available';
  slotRateEl.textContent = slot.rate;
  toggleSlotBtn.textContent = isOccupied ? 'Release slot' : 'Book this slot';
  toggleSlotBtn.disabled = false;
  resetSlotBtn.disabled = false;
}

function render() {
  renderSlotGrid('groundFloorSlots', 'ground');
  renderSlotGrid('upperFloorSlots', 'upper');
  getStats();
  renderDetailPanel();
  renderActivity();
}

async function updateSlotOnServer(slotId, newState) {
  if (window.supabaseClient && window.isSupabaseConfigured()) {
    const { data, error } = await window.supabaseClient
      .from('parking_slots')
      .update({
        status: newState.status,
        vehicle: newState.vehicle || '',
        entry_time: newState.entryTime || null
      })
      .eq('id', slotId)
      .select();

    if (error) throw error;

    const updatedSlot = data && data[0];
    if (updatedSlot) {
      const slotIndex = slots.findIndex((slot) => slot.id === slotId);
      if (slotIndex >= 0) {
        slots[slotIndex] = {
          id: updatedSlot.id,
          floor: updatedSlot.floor,
          status: updatedSlot.status,
          vehicle: updatedSlot.vehicle || '',
          entryTime: updatedSlot.entry_time || '',
          rate: updatedSlot.rate || '$5/hr'
        };
      }
    }
    return;
  }

  const response = await fetch('/api/slots', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: slotId, ...newState })
  });

  if (!response.ok) {
    throw new Error('Could not update slot');
  }

  const updatedSlot = await response.json();
  const slotIndex = slots.findIndex((slot) => slot.id === slotId);
  if (slotIndex >= 0) {
    slots[slotIndex] = updatedSlot;
  }
}

async function toggleSelectedSlot() {
  const slot = getSelectedSlot();
  if (!slot) return;

  if (slot.status !== 'occupied') {
    openVehicleDialog(slot.id);
    return;
  }

  toggleSlotBtn.disabled = true;
  resetSlotBtn.disabled = true;
  try {
    await updateSlotOnServer(slot.id, { status: 'free', vehicle: '', entryTime: '' });
    activityList.unshift(`${slot.id} was released and made available`);
    render();
    showStatusMessage(`${slot.id} is available now.`);
  } catch (error) {
    console.error(error);
    showStatusMessage(`Could not release ${slot.id}. Please try again.`, true);
  } finally {
    toggleSlotBtn.disabled = false;
    resetSlotBtn.disabled = false;
  }
}

async function resetSelectedSlot() {
  const slot = getSelectedSlot();
  if (!slot) return;

  toggleSlotBtn.disabled = true;
  resetSlotBtn.disabled = true;
  try {
    await updateSlotOnServer(slot.id, { status: 'free', vehicle: '', entryTime: '' });
    activityList.unshift(`${slot.id} was reset and is available`);
    render();
    showStatusMessage(`${slot.id} has been reset.`);
  } catch (error) {
    console.error(error);
    showStatusMessage(`Could not reset ${slot.id}. Please try again.`, true);
  } finally {
    toggleSlotBtn.disabled = false;
    resetSlotBtn.disabled = false;
  }
}

function openVehicleDialog(preselectedSlotId = '') {
  const availableSlots = slots.filter((slot) => slot.status !== 'occupied');
  vehicleSlotEl.replaceChildren(...availableSlots.map((slot) => {
    const option = document.createElement('option');
    option.value = slot.id;
    option.textContent = `${slot.id} · ${slot.floor === 'ground' ? 'Ground floor' : 'Upper floor'} · ${slot.rate}`;
    return option;
  }));
  vehicleFormMessageEl.hidden = true;
  vehiclePlateEl.value = '';
  if (preselectedSlotId && availableSlots.some((slot) => slot.id === preselectedSlotId)) {
    vehicleSlotEl.value = preselectedSlotId;
  }
  saveVehicleBtn.disabled = availableSlots.length === 0;
  vehicleFormMessageEl.textContent = availableSlots.length ? '' : 'There are no available parking slots.';
  vehicleFormMessageEl.hidden = availableSlots.length > 0;
  vehicleDialog.showModal();
  if (availableSlots.length) vehiclePlateEl.focus();
}

async function addVehicle(event) {
  event.preventDefault();
  vehicleFormMessageEl.hidden = true;

  if (!vehicleForm.reportValidity()) return;

  const slot = slots.find((item) => item.id === vehicleSlotEl.value);
  const vehicle = vehiclePlateEl.value.trim().toUpperCase();
  if (!slot || slot.status === 'occupied') {
    vehicleFormMessageEl.textContent = 'That slot is no longer available. Choose another slot.';
    vehicleFormMessageEl.hidden = false;
    return;
  }
  if (!/^(?=.*[A-Z0-9])[A-Z0-9 -]{2,20}$/.test(vehicle)) {
    vehicleFormMessageEl.textContent = 'Enter a valid plate using letters, numbers, spaces, or hyphens.';
    vehicleFormMessageEl.hidden = false;
    return;
  }

  saveVehicleBtn.disabled = true;
  try {
    const entryTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    await updateSlotOnServer(slot.id, { status: 'occupied', vehicle, entryTime });
    selectedSlotId = slot.id;
    activityList.unshift(`${vehicle} parked in ${slot.id} at ${entryTime}`);
    render();
    vehicleDialog.close();
    showStatusMessage(`${vehicle} was added to ${slot.id}.`);
  } catch (error) {
    console.error('Could not add vehicle:', error);
    vehicleFormMessageEl.textContent = 'Could not save this booking. Check your connection and try again.';
    vehicleFormMessageEl.hidden = false;
  } finally {
    saveVehicleBtn.disabled = false;
  }
}

function setupNavigation() {
  document.querySelectorAll('[data-nav-target]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.navTarget).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-nav-action="booking"]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      openVehicleDialog();
    });
  });
}

toggleSlotBtn.addEventListener('click', toggleSelectedSlot);
resetSlotBtn.addEventListener('click', resetSelectedSlot);
addVehicleBtn.addEventListener('click', () => openVehicleDialog());
vehicleForm.addEventListener('submit', addVehicle);
document.getElementById('cancelVehicleBtn').addEventListener('click', () => vehicleDialog.close());
setupNavigation();

updateClock();
loadSlots();
setInterval(updateClock, 30000);
