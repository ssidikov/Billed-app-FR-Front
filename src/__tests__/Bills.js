/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'; // Import additional Jest matchers for the DOM
import { screen, waitFor } from '@testing-library/dom'; // Import functions for working with the DOM
import BillsUI from '../views/BillsUI.js'; // Import Bills user interface
import { bills } from '../fixtures/bills.js'; // Import test data for bills
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'; // Import routes
import { localStorageMock } from '../__mocks__/localStorage.js'; // Import mock for localStorage
import Bills from '../containers/Bills.js'; // Import Bills class
import mockStore from '../__mocks__/store.js'; // Import mock for store
import userEvent from '@testing-library/user-event'; // Import for simulating user actions
import router from '../app/Router.js'; // Import router

// Mock store for testing
jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    // Test to check if the bill icon in the vertical layout is highlighted
    test('Then bill icon in vertical layout should be highlighted', async () => {
      // Set localStorage value for user
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      // Create and set the root element for routing
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      // Initialize the router and navigate to the bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // Wait for the element with test id 'icon-window' to be in the DOM
      await waitFor(() => screen.getByTestId('icon-window'));
      // Check if the bill icon is highlighted (has the 'active-icon' class)
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon).toHaveClass('active-icon');
    });

    // Test to check if the bills are correctly displayed
    test('Then bills should be ordered from earliest to latest', () => {
      // Render the BillsUI with test data
      document.body.innerHTML = BillsUI({ data: bills });
      // Get all date elements and convert them to an array of strings
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      // Function to sort dates in descending order
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      // Check if the dates are sorted correctly
      expect(dates).toEqual(datesSorted);
    });
  });
});

// Testing the handleClickIconEye function and the opening of the modal
describe('Given I am connected as Employee and I am on Bills page', () => {
  describe('When I click on the icon eye', () => {
    test('It should launch the handleClickIconEye function and open the modal', () => {
      // Set localStorage value for user
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

      // Create an instance of the Bills class
      const billsInit = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Mock jQuery modal function
      $.fn.modal = jest.fn();

      // Get the first icon eye element
      const eye = screen.getAllByTestId('icon-eye')[0];

      // Mock handleClickIconEye function
      const handleClickIconEye = jest.fn(() => billsInit.handleClickIconEye(eye));
      eye.addEventListener('click', handleClickIconEye);

      // Simulate a click on the icon eye
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
      // Define navigation function
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Render the BillsUI with test data
      document.body.innerHTML = BillsUI({ data: bills });

      // Create an instance of the Bills class
      const billsUI = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Mock handleClickNewBill function
      const handleClickNewBill = jest.fn(billsUI.handleClickNewBill);

      // Get the button to create a new bill
      const btnNewBill = screen.getByTestId('btn-new-bill');
      btnNewBill.addEventListener('click', handleClickNewBill);

      // Simulate a click on the button to create a new bill
      userEvent.click(btnNewBill);

      // Assertions
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
});

// Integration test for GET requests on the Bills page
describe('Given I am a user connected as Employee', () => {
  describe('When I am on Bills Page', () => {
    // Test to check if the bills are correctly fetched from the API
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
    // Handling errors when making API requests
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a',
          })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
        router();
      });
      // Test for handling 404 error when fetching bills from API
      test('fetches bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error('Erreur 404')),
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      // Test for handling 500 error when fetching bills from API
      test('fetches bills from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error('Erreur 500')),
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
