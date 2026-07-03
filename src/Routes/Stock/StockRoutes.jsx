import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Stock = lazy(() => import('../../Pages/Stock/Stock'));
const Store = lazy(() => import('../../Pages/Stock/Stores'));
const Items = lazy(() => import('../../Pages/Stock/Items'));
const Transactions = lazy(() => import('../../Pages/Stock/Transactions'));
const Movement = lazy(() => import('../../Pages/Stock/Movement'));
const ClassConfig = lazy(() => import('../../Pages/Stock/ClassConfig/ClassConfig'));
const StudentOrders = lazy(() => import('../../Pages/Stock/StudentOrders/StudentOrders'));
const CreateStudentOrder = lazy(() => import('../../Pages/Stock/StudentOrders/CreateStudentOrder'));
const EditStudentOrder = lazy(() => import('../../Pages/Stock/StudentOrders/EditStudentOrder'));

export default function StockRoutes() {
  return (
    <>
      {/* Accountant-level stock management */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.STOCK_ACCOUNTANT_ROLES} />}>
        <Route path={ROUTE_PATHS.STOCK} element={<Stock />} />
        <Route path={ROUTE_PATHS.STOCK_STORES} element={<Store />} />
        <Route path={ROUTE_PATHS.STOCK_ITEMS} element={<Items />} />
        <Route path={ROUTE_PATHS.STOCK_CLASS_CONFIG} element={<ClassConfig />} />
        <Route path={ROUTE_PATHS.STOCK_TRANSACTIONS} element={<Transactions />} />
        <Route path={ROUTE_PATHS.STOCK_MOVEMENT_HISTORY} element={<Movement />} />
      </Route>

      {/* Seller-level stock (includes accountant roles + STORE_SELLER) */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.STOCK_SELLER_ROLES} />}>
        <Route path={ROUTE_PATHS.STOCK_STUDENT_ORDERS} element={<StudentOrders />} />
        <Route path={ROUTE_PATHS.STOCK_STUDENT_ORDERS_ADD} element={<CreateStudentOrder />} />
        <Route path={ROUTE_PATHS.STOCK_STUDENT_ORDERS_EDIT} element={<EditStudentOrder />} />
      </Route>
    </>
  );
}
