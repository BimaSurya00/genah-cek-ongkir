<script>
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import shippingService from "$lib/api/shippingService";

  // Form state
  let asalQuery = "";
  let tujuanQuery = "";
  let beratPaket = "";

  // Selected addresses
  let selectedAsal = null;
  let selectedTujuan = null;

  // Search results
  let asalResults = [];
  let tujuanResults = [];

  // UI state
  let showAsalDropdown = false;
  let showTujuanDropdown = false;
  let isSearchingAsal = false;
  let isSearchingTujuan = false;
  let isLoading = false;
  let showResult = false;
  let errorMessage = "";

  // Shipping results
  let shippingResults = [];
  let shippingMeta = null;

  // Debounce timers
  let asalTimer;
  let tujuanTimer;

  async function searchAsal() {
    if (asalQuery.length < 2) {
      asalResults = [];
      showAsalDropdown = false;
      return;
    }

    isSearchingAsal = true;
    try {
      const response = await shippingService.searchAddress(asalQuery);
      asalResults = response.data || [];
      showAsalDropdown = asalResults.length > 0;
    } catch (error) {
      asalResults = [];
    } finally {
      isSearchingAsal = false;
    }
  }

  async function searchTujuan() {
    if (tujuanQuery.length < 2) {
      tujuanResults = [];
      showTujuanDropdown = false;
      return;
    }

    isSearchingTujuan = true;
    try {
      const response = await shippingService.searchAddress(tujuanQuery);
      tujuanResults = response.data || [];
      showTujuanDropdown = tujuanResults.length > 0;
    } catch (error) {
      tujuanResults = [];
    } finally {
      isSearchingTujuan = false;
    }
  }

  function handleAsalInput() {
    selectedAsal = null;
    clearTimeout(asalTimer);
    asalTimer = setTimeout(searchAsal, 300);
  }

  function handleTujuanInput() {
    selectedTujuan = null;
    clearTimeout(tujuanTimer);
    tujuanTimer = setTimeout(searchTujuan, 300);
  }

  function selectAsal(address) {
    selectedAsal = address;
    asalQuery = shippingService.formatAddress(address);
    showAsalDropdown = false;
    asalResults = [];
  }

  function selectTujuan(address) {
    selectedTujuan = address;
    tujuanQuery = shippingService.formatAddress(address);
    showTujuanDropdown = false;
    tujuanResults = [];
  }

  async function handleCekOngkir() {
    if (!selectedAsal || !selectedTujuan || !beratPaket) {
      errorMessage = "Lengkapi semua field terlebih dahulu";
      return;
    }

    errorMessage = "";
    isLoading = true;
    showResult = false;

    try {
      const response = await shippingService.getPricing({
        from: selectedAsal.id,
        thru: selectedTujuan.id,
        weight: beratPaket,
      });

      if (response.name === "SUCCESS" && response.data) {
        shippingResults = response.data;
        shippingMeta = response.meta;
        showResult = true;
      } else {
        errorMessage = response.message || "Gagal mendapatkan data ongkir";
      }
    } catch (error) {
      errorMessage = error.message || "Terjadi kesalahan saat mengecek ongkir";
    } finally {
      isLoading = false;
    }
  }

  function handleClickOutside(event) {
    if (!event.target.closest(".asal-wrapper")) {
      showAsalDropdown = false;
    }
    if (!event.target.closest(".tujuan-wrapper")) {
      showTujuanDropdown = false;
    }
  }

  $: cheapestPrice =
    shippingResults.length > 0
      ? Math.min(...shippingResults.map((r) => parseInt(r.cost)))
      : 0;
</script>

<svelte:head>
  <title>Cek Ongkir - Genah Express</title>
  <meta name="description" content="Cek ongkos kirim dengan mudah dan cepat" />
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-stone-50 p-4 md:p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center space-y-3 pt-6">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 mb-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <h1 class="text-3xl font-semibold text-stone-800 tracking-tight">
        Cek Ongkir
      </h1>
      <p class="text-stone-500">
        Hitung biaya pengiriman paket Anda ke seluruh Indonesia
      </p>
    </div>

    <!-- Form Card -->
    <Card.Root class="border border-stone-200 shadow-sm">
      <Card.Header class="pb-4 border-b border-stone-100 bg-stone-50/50">
        <Card.Title class="text-lg text-stone-800 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Detail Pengiriman
        </Card.Title>
        <Card.Description class="text-stone-500">
          Lengkapi informasi di bawah untuk cek ongkos kirim
        </Card.Description>
      </Card.Header>

      <Card.Content class="space-y-5 pt-6">
        <!-- Asal Daerah -->
        <div class="space-y-2 asal-wrapper relative">
          <Label
            for="asal"
            class="text-sm font-medium text-stone-700 flex items-center gap-2"
          >
            <span
              class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            Asal Daerah
          </Label>
          <div class="relative">
            <Input
              type="text"
              id="asal"
              placeholder="Ketik nama kota/kecamatan/kelurahan..."
              bind:value={asalQuery}
              on:input={handleAsalInput}
              on:focus={() =>
                asalResults.length > 0 && (showAsalDropdown = true)}
              class="w-full h-11 bg-white border-stone-300 text-stone-800 placeholder:text-stone-400 hover:border-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10"
            />
            {#if isSearchingAsal}
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  class="animate-spin h-4 w-4 text-stone-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            {:else if selectedAsal}
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            {/if}
          </div>

          {#if showAsalDropdown}
            <div
              class="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {#each asalResults as address}
                <button
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-stone-100 last:border-b-0"
                  on:click={() => selectAsal(address)}
                >
                  <p class="text-sm font-medium text-stone-800">
                    {address.sub_district_name}, {address.district_name}
                  </p>
                  <p class="text-xs text-stone-500">
                    {address.region_name}, {address.province_name}
                  </p>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Arrow -->
        <div class="flex justify-center">
          <div
            class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-emerald-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- Tujuan Daerah -->
        <div class="space-y-2 tujuan-wrapper relative">
          <Label
            for="tujuan"
            class="text-sm font-medium text-stone-700 flex items-center gap-2"
          >
            <span
              class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            Tujuan Daerah
          </Label>
          <div class="relative">
            <Input
              type="text"
              id="tujuan"
              placeholder="Ketik nama kota/kecamatan/kelurahan..."
              bind:value={tujuanQuery}
              on:input={handleTujuanInput}
              on:focus={() =>
                tujuanResults.length > 0 && (showTujuanDropdown = true)}
              class="w-full h-11 bg-white border-stone-300 text-stone-800 placeholder:text-stone-400 hover:border-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10"
            />
            {#if isSearchingTujuan}
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  class="animate-spin h-4 w-4 text-stone-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            {:else if selectedTujuan}
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            {/if}
          </div>

          {#if showTujuanDropdown}
            <div
              class="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {#each tujuanResults as address}
                <button
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-stone-100 last:border-b-0"
                  on:click={() => selectTujuan(address)}
                >
                  <p class="text-sm font-medium text-stone-800">
                    {address.sub_district_name}, {address.district_name}
                  </p>
                  <p class="text-xs text-stone-500">
                    {address.region_name}, {address.province_name}
                  </p>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Berat Paket -->
        <div class="space-y-2">
          <Label
            for="berat"
            class="text-sm font-medium text-stone-700 flex items-center gap-2"
          >
            <span
              class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </span>
            Berat Paket
          </Label>
          <div class="relative">
            <Input
              type="number"
              id="berat"
              placeholder="Masukkan berat paket"
              bind:value={beratPaket}
              class="w-full h-11 bg-white border-stone-300 text-stone-800 placeholder:text-stone-400 hover:border-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12"
              min="1"
              step="1"
            />
            <span
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-500 text-sm font-medium"
            >
              gram
            </span>
          </div>
        </div>

        {#if errorMessage}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-600">{errorMessage}</p>
          </div>
        {/if}
      </Card.Content>

      <Card.Footer class="pt-4 pb-6">
        <Button
          class="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={handleCekOngkir}
          disabled={!selectedAsal ||
            !selectedTujuan ||
            !beratPaket ||
            isLoading}
        >
          {#if isLoading}
            <div class="flex items-center gap-2">
              <svg
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Mengecek Ongkir...</span>
            </div>
          {:else}
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Cek Ongkos Kirim</span>
            </div>
          {/if}
        </Button>
      </Card.Footer>
    </Card.Root>

    <!-- Results -->
    {#if showResult}
      <div class="space-y-6">
        <!-- Summary -->
        <div class="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-stone-800 mb-2">
                Hasil Pencarian Ongkir
              </h2>
              {#if shippingMeta}
                <div
                  class="flex flex-wrap items-center gap-2 text-sm text-stone-600"
                >
                  <span
                    class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium"
                    >{shippingMeta.origin}</span
                  >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-stone-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  <span
                    class="bg-red-100 text-red-700 px-2 py-1 rounded-md font-medium"
                    >{shippingMeta.destination}</span
                  >
                  <span class="text-stone-400">•</span>
                  <span
                    class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium"
                    >{shippingMeta.weight} gram</span
                  >
                </div>
              {/if}
            </div>
            <div class="text-right">
              <p class="text-sm text-stone-500">Mulai dari</p>
              <p class="text-2xl font-bold text-emerald-600">
                {shippingService.formatPrice(cheapestPrice)}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div
            class="bg-white border border-stone-200 rounded-lg p-4 text-center"
          >
            <p class="text-2xl font-bold text-emerald-600">
              {shippingResults.length}
            </p>
            <p class="text-xs text-stone-500 mt-1">Total Kurir</p>
          </div>
          <div
            class="bg-white border border-stone-200 rounded-lg p-4 text-center"
          >
            <p class="text-2xl font-bold text-blue-600">
              {shippingResults.filter((r) => r.cod).length}
            </p>
            <p class="text-xs text-stone-500 mt-1">Support COD</p>
          </div>
          <div
            class="bg-white border border-stone-200 rounded-lg p-4 text-center"
          >
            <p class="text-2xl font-bold text-orange-600">
              {shippingResults.filter((r) => r.etd === "1" || r.etd === "1-2")
                .length}
            </p>
            <p class="text-xs text-stone-500 mt-1">Same Day/Express</p>
          </div>
        </div>

        <!-- Courier Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each shippingResults as result}
            <div
              class="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            >
              <h3
                class="font-semibold text-stone-800 text-base mb-3 leading-tight"
                title={result.service_name}
              >
                {result.service_name}
              </h3>

              <div class="space-y-2 mb-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-stone-500">Estimasi</span>
                  <span class="text-sm font-medium text-stone-800"
                    >{result.etd} hari</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-stone-500">COD</span>
                  <span
                    class="text-sm font-medium {result.cod
                      ? 'text-emerald-600'
                      : 'text-stone-400'}"
                  >
                    {result.cod ? "Tersedia" : "Tidak tersedia"}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-stone-500">Opsi Pengiriman</span>
                  <span class="text-sm font-medium text-stone-800">
                    {result.drop ? "Pick Up & Drop Off" : "Pick Up"}
                  </span>
                </div>
              </div>

              <div class="pt-3 border-t border-stone-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-stone-500">Tarif</span>
                  <span class="text-xl font-bold text-emerald-600"
                    >{shippingService.formatPrice(result.cost)}</span
                  >
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Footer -->
    <div class="text-center text-stone-400 text-sm pb-6">
      <p>© 2026 Genah Express</p>
    </div>
  </div>
</div>
