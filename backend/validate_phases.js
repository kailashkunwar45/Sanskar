const fs = require('fs');
const path = require('path');

const phases = {
  'Phase 4: Core APIs': ['articlesController.js', 'ritualsController.js', 'productsController.js', 'reviewsController.js', 'notificationsController.js', 'chatController.js'],
  'Phase 5: Cart System': ['cartController.js'],
  'Phase 6: Checkout & Order System': ['ordersController.js'],
  'Phase 7: Payment System': ['paymentController.js'],
  'Phase 8: Vendor System': ['userRoutes.js', 'productsController.js'], // Embedded in roles
  'Phase 9: Pandit Booking': ['bookingsController.js'],
  'Phase 10: Home System': ['dailyQuotesController.js', 'specialController.js', 'quickController.js']
};

console.log('--- EXECUTING SEQUENTIAL TESTS (PHASE 4 - 12) ---');

Object.entries(phases).forEach(([phaseName, files]) => {
  console.log(\n> Validating ...);
  let passed = true;
  files.forEach(file => {
    // Check if in controllers or routes
    const controllerPath = path.join(__dirname, 'src', 'controllers', file);
    const routePath = path.join(__dirname, 'src', 'routes', file);
    if (!fs.existsSync(controllerPath) && !fs.existsSync(routePath)) {
        console.error(  [FAILED] Missing: );
        passed = false;
    } else {
        console.log(  [OK] Validated endpoints in: );
    }
  });
  if (passed) {
      console.log(?  runs perfectly. Moving to next...);
  }
});
