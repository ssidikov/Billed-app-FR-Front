/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import Bills from '../containers/Bills.js';
import mockStore from '../__mocks__/store.js';
import userEvent from '@testing-library/user-event';
import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon).toHaveClass('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// Testing the handleClickIconEye function
describe('Given I am connected as Employee and I am on Bills page', () => {
  describe('When I click on the icon eye', () => {
    test('It should launch the handleClickIconEye function and open the modal', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      // Render the BillsUI with test data
      document.body.innerHTML = BillsUI({ data: bills });
      // Define navigation function
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      // Create an instance of Bills
      const billsInit = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Mock jQuery modal function
      $.fn.modal = jest.fn();

      //Getting the first icon eye
      const eye = screen.getAllByTestId('icon-eye')[0];

      //Mocking the handleClickIconEye function
      const handleClickIconEye = jest.fn(() => billsInit.handleClickIconEye(eye));
      eye.addEventListener('click', handleClickIconEye);

      //Simulation of a click on the icon
      userEvent.click(eye);

      // Assertions
      expect(handleClickIconEye).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalledWith('show');
    });
  });
});

// Testing the handleClickNewBill function and the rendering of the NewBill page
describe('Given I am a user connected as Employee', () => {
  describe('When I click on the button to create a new bill', () => {
    test('It should render NewBill page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Render the BillsUI with test data
      document.body.innerHTML = BillsUI({ data: bills });

      //Creation of an instance of Bills
      const billsUI = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Mock handleClickNewBill function
      const handleClickNewBill = jest.fn(billsUI.handleClickNewBill);

      // Get the new bill button
      const btnNewBill = screen.getByTestId('btn-new-bill');
      btnNewBill.addEventListener('click', handleClickNewBill);

      // Simulate a click on the button
      userEvent.click(btnNewBill);

      // Assertions
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
});
