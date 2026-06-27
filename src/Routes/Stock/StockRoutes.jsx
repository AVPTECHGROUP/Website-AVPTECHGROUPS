import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Stock = lazy(() => import('../../Pages/Stock/Stock'));
const Store = lazy(() => import('../../Pages/Stock/Stores'));
const Items = lazy(() => import('../../Pages/Stock/Items'));
const Transactions = lazy(() => import('../../Pages/Stock/Transactions'));
const Movement = lazy(() => import('../../Pages/Stock/Movement'));
const ClassConfig = lazy(() => import('../../Pages/Stock/ClassConfig/ClassConfig'));
const StudentOrders = lazy(() => import('../../Pages/Stock/StudentOrders/StudentOrders'));
const CreateStudentOrder = lazy(() => import('../../Pages/Stock/StudentOrders/CreateStudentOrder'));
const EditStudentOrder = lazy(() => import('../../Pages/Stock/StudentOrders/EditStudentOrder'));

const STOCK_ACCOUNTANT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT'];
const STOCK_SELLER_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT', 'STORE_SELLER'];

export default function StockRoutes() {
  return (
  <>
    {/* Accountant-level stock management */}
    <Route element={<RoleProtectedRoute allowedRoles={STOCK_ACCOUNTANT_ROLES} />}>
      <Route path="/stock" element={<Stock />} />
      <Route path="/stock/stores" element={<Store />} />
      <Route path="/stock/items" element={<Items />} />
      <Route path="/stock/classConfig" element={<ClassConfig />} />
      <Route path="/stock/transactions" element={<Transactions />} />
      <Route path="/stock/movementHistory" element={<Movement />} />
    </Route>

    {/* Seller-level stock (includes accountant roles + STORE_SELLER) */}
    <Route element={<RoleProtectedRoute allowedRoles={STOCK_SELLER_ROLES} />}>
      <Route path="/stock/studentOrders" element={<StudentOrders />} />
      <Route path="/stock/studentOrders/addOrder" element={<CreateStudentOrder />} />
      <Route path="/stock/studentOrders/editOrder" element={<EditStudentOrder />} />
    </Route>
  </>
  );
}

