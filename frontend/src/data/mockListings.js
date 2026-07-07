// Mock data so the frontend runs without waiting on the backend.
// Agree on these exact field names with the backend team, then this
// whole file gets replaced by a fetch() call. Nothing else changes.
export const listings = [
  { id: 1, type: "apartment", name: "The Lofts at GSU",   address: "75 Piedmont Ave NE",  rating: 4.3, reviewCount: 12, verified: true, rentMin: 1150, rentMax: 1400, distanceMi: 0.4 },
  { id: 2, type: "apartment", name: "Auburn Ave Flats",   address: "210 Auburn Ave NE",   rating: 4.6, reviewCount: 8,  verified: true, rentMin: 1300, rentMax: 1650, distanceMi: 0.6 },
  { id: 3, type: "apartment", name: "Edgewood Court",     address: "130 Edgewood Ave SE", rating: 4.0, reviewCount: 15, verified: true, rentMin: 1050, rentMax: 1300, distanceMi: 0.5 },
  { id: 4, type: "dorm",      name: "Piedmont Central",   address: "103 Edgewood Ave",    rating: 4.1, reviewCount: 34, verified: true, pricePerSemester: 4400, roomType: "Suite",     mealPlan: true },
  { id: 5, type: "dorm",      name: "Piedmont North",     address: "141 Piedmont Ave",    rating: 3.9, reviewCount: 28, verified: true, pricePerSemester: 3900, roomType: "Double",    mealPlan: true },
  { id: 6, type: "dorm",      name: "University Commons",  address: "141 Walton St NW",    rating: 4.3, reviewCount: 19, verified: true, pricePerSemester: 4100, roomType: "Apt-style", mealPlan: false },
];
