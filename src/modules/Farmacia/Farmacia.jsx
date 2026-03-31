import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DespachoSection from "./components/DespachoSection";
import CamasSection from "./components/CamasSection";
import Inventario from "./components/Inventario";
import Ingresos from "./components/Ingresos";
import TableMedicamentos from "./components/TableMedicamentos";
import Ventas from "./components/Ventas";
import Modals from "./components/Modals";
import Toast from "./components/Toast";
import useFarmaciaModule from "./hook/useFarmaciaModule";
import "./styles/farmacia.css";

const Farmacia = () => {
  const farmacia = useFarmaciaModule();

  const renderActiveSection = () => {
    if (farmacia.activeTab === "desp") {
      return (
        <DespachoSection
          kpis={farmacia.kpis}
          orders={farmacia.dispatchSearch}
          criticalInventory={farmacia.criticalInventory}
          search={farmacia.searchDesp}
          onSearchChange={farmacia.setSearchDesp}
          onDispatchAll={farmacia.handleDispatchAll}
          onDispatchOrder={farmacia.handleDispatchOrder}
          onOpenPos={() => farmacia.setActiveTab("pos")}
          helpers={farmacia.helpers}
        />
      );
    }

    if (farmacia.activeTab === "camas") {
      return (
        <CamasSection
          beds={farmacia.filteredBeds}
          search={farmacia.searchBeds}
          onSearchChange={farmacia.setSearchBeds}
          bedsFilter={farmacia.bedsFilter}
          onChangeFilter={farmacia.setBedsFilter}
        />
      );
    }

    if (farmacia.activeTab === "inv") {
      return (
        <Inventario
          inventoryTypes={farmacia.inventoryTypes}
          inventoryByType={farmacia.inventoryByType}
          search={farmacia.searchInventory}
          onSearchChange={farmacia.setSearchInventory}
          inventoryFilter={farmacia.inventoryFilter}
          onChangeFilter={farmacia.setInventoryFilter}
          onOpenNewItem={() => farmacia.setNewItemOpen(true)}
          onOpenRestock={farmacia.handleOpenRestock}
          helpers={farmacia.helpers}
        />
      );
    }

    if (farmacia.activeTab === "ing") {
      return (
        <Ingresos
          ingresos={farmacia.ingresos}
          ingresoForm={farmacia.ingresoForm}
          onIngresoFormChange={(field, value) =>
            farmacia.setIngresoForm((prev) => ({ ...prev, [field]: value }))
          }
          onLookupCode={farmacia.handleLookupIngresoCode}
          onRegisterIngreso={farmacia.handleRegisterIngreso}
          bodegas={farmacia.metadata.bodegas}
        />
      );
    }

    if (farmacia.activeTab === "hist") {
      return (
        <TableMedicamentos
          historyRows={farmacia.historyRows}
          search={farmacia.searchHistory}
          onSearchChange={farmacia.setSearchHistory}
          onExportCsv={farmacia.handleExportHistoryCsv}
          onShowToast={farmacia.showToast}
        />
      );
    }

    return (
      <Ventas
        search={farmacia.searchPos}
        onSearchChange={farmacia.setSearchPos}
        matches={farmacia.posMatches}
        cart={farmacia.cart}
        helpers={farmacia.helpers}
        posForm={farmacia.posForm}
        paymentOptions={farmacia.paymentOptions}
        onPosFormChange={(field, value) =>
          farmacia.setPosForm((prev) => ({ ...prev, [field]: value }))
        }
        onAddCartItem={farmacia.handleAddCartItem}
        onChangeCartQty={farmacia.handleChangeCartQty}
        onFinalizeSale={farmacia.handleFinalizeSale}
        onCancelSale={farmacia.handleCancelSale}
        totalSales={farmacia.metadata.totalSales}
        totalSalesCount={farmacia.metadata.totalSalesCount}
        saleReceiptCounter={farmacia.metadata.saleReceiptCounter}
      />
    );
  };

  return (
    <div className="farmacia">
      <div className="farmacia-shell">
        <Header
          clock={farmacia.clock}
          criticalCount={farmacia.criticalInventory.length}
          onShowInventory={() => farmacia.setActiveTab("inv")}
          onOpenNewItem={() => farmacia.setNewItemOpen(true)}
          onToggleAlerts={() =>
            farmacia.showToast(
              farmacia.criticalInventory.length
                ? `⚠ ${farmacia.criticalInventory.length} item(s) con stock crítico`
                : "✅ Sin alertas de stock",
              "a"
            )
          }
        />

        <Sidebar
          activeTab={farmacia.activeTab}
          onChangeTab={farmacia.setActiveTab}
          pendingOrders={farmacia.kpis.pendientes}
          occupiedBeds={farmacia.beds.filter((bed) => bed.estado === "ocupado").length}
        />

        <div id="content">
          {farmacia.loading ? (
            <div className="card">
              <div className="cbody">Cargando módulo de farmacia...</div>
            </div>
          ) : (
            renderActiveSection()
          )}
        </div>

        <Modals
          newItemOpen={farmacia.newItemOpen}
          onCloseNewItem={() => farmacia.setNewItemOpen(false)}
          newItemForm={farmacia.newItemForm}
          onNewItemFormChange={(field, value) =>
            farmacia.setNewItemForm((prev) => ({ ...prev, [field]: value }))
          }
          onCreateNewItem={farmacia.handleCreateNewItem}
          restockTarget={farmacia.restockTarget}
          restockForm={farmacia.restockForm}
          onRestockFormChange={(field, value) =>
            farmacia.setRestockForm((prev) => ({ ...prev, [field]: value }))
          }
          onCloseRestock={() => farmacia.setRestockTargetId(null)}
          onConfirmRestock={farmacia.handleConfirmRestock}
          helpers={farmacia.helpers}
          bodegas={farmacia.metadata.bodegas}
        />

        <Toast toast={farmacia.toast} onClose={farmacia.clearToast} />
      </div>
    </div>
  );
};

export default Farmacia;
