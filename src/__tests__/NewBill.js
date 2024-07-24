/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';

// Mock the store module
jest.mock('../app/Store', () => mockStore);

describe('NewBill Page Tests', () => {
  // Setup for each test
  beforeEach(() => {
    // Mock localStorage and set a default user
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem(
      'user',
      JSON.stringify({ type: 'Employee', email: 'employee@test.ltd' })
    );

    // Set up the root element and initialize the router
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
    router();
  });

  describe('When I am on the NewBill Page', () => {
    test('Then the new bill form should be rendered', () => {
      // Render the NewBill UI
      document.body.innerHTML = NewBillUI();

      // Verify that the new bill form is present
      expect(screen.getByTestId('form-new-bill')).toBeInTheDocument();
    });

    test("Then I can't upload a file with an extension other than png, jpg, or jpeg", () => {
      // Render the NewBill UI
      document.body.innerHTML = NewBillUI();

      // Create an instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Mock handleChangeFile function and set up event listener
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const input = screen.getByTestId('file');
      input.addEventListener('change', handleChangeFile);

      // Upload a PDF file
      userEvent.upload(input, new File(['document'], 'document.pdf', { type: 'application/pdf' }));

      // Verify that handleChangeFile was called and the input value is cleared
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.value).toBe('');
    });

    test('Then an error message should be displayed when uploading an invalid file format (pdf)', async () => {
      // Render the NewBill UI
      document.body.innerHTML = NewBillUI();

      // Create an instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Get the file input element and define a PDF file
      const input = screen.getByTestId('file');
      const file = new File(['document'], 'document.pdf', { type: 'application/pdf' });

      // Mock handleChangeFile function
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener('change', handleChangeFile);

      // Upload the PDF file
      userEvent.upload(input, file);

      // Wait for the error message to appear and verify its content
      await waitFor(() => {
        const errorMessage = screen.getByTestId('file-error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).toContain(
          "Le type de fichier attendu est JPG, JPEG et PNG. Le PDF n'est pas pris en charge."
        );
      });
    });

    test('Then I can upload a file with a valid format (png, jpg, or jpeg)', () => {
      // Render the NewBill UI
      document.body.innerHTML = NewBillUI();

      // Create an instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Get the file input element and define a valid image file
      const input = screen.getByTestId('file');
      const file = new File(['image'], 'receipt.jpg', { type: 'image/jpg' });

      // Mock handleChangeFile function and set up event listener
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener('change', handleChangeFile);

      // Upload the image file
      userEvent.upload(input, file);

      // Verify that handleChangeFile was called and the file input value is correct
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0]).toStrictEqual(file);
      expect(input.files[0].name).toBe('receipt.jpg');
    });

    test('Then it should create a new bill', () => {
      // Render the NewBill UI
      document.body.innerHTML = NewBillUI();

      // Create an instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mock handleSubmit function and set up event listener
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', handleSubmit);

      // Fill in the form fields
      userEvent.type(screen.getByTestId('datepicker'), '2024-07-24');
      userEvent.type(screen.getByTestId('amount'), '100');
      userEvent.type(screen.getByTestId('pct'), '20');
      userEvent.upload(
        screen.getByTestId('file'),
        new File(['image'], 'receipt.jpg', { type: 'image/jpg' })
      );

      // Submit the form
      fireEvent.submit(form);

      // Verify that handleSubmit was called and the form is present
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeInTheDocument();
    });
  });
});
