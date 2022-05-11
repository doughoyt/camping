import {searchResultEqual} from '../src/utils.mjs';

test('Basic Tests', () => {

    const site1 = 12;
    const site2 = "012";
    const site3 = "B";

    expect(isNaN(site1)).toBe(false);
    expect(isNaN(site2)).toBe(false);
    expect(isNaN(site3)).toBe(true);

});

test('Basic Shallow Tests', () => {

    const map1 = new Map();
    const map2 = new Map();
    const undefinedMap = undefined;

    expect(searchResultEqual(undefinedMap, map2)).toBe(false);
    expect(searchResultEqual(map1, undefinedMap)).toBe(false);

    map1.set("z", 0);
    map1.set("a", 1);
    map2.set("z", 0);
    expect(searchResultEqual(map1, map2)).toBe(false);

});

test('Basic Map of Map Tests', () => {

    const outerMap1 = new Map();
    const innerMap10 = new Map();
    const outerMap2 = new Map();
    const innerMap20 = new Map();
    const innerMap21 = new Map();
    const campgroundName1 = 'Campground Name 1';
    const campgroundName2 = 'Campground Name 2';

    // Same campground name, empty sites Map
    outerMap1.set(campgroundName1, innerMap10);
    outerMap2.set(campgroundName1, innerMap20);
    //expect(searchResultEqual(outerMap1, outerMap2)).toBe(true);

    // Different campground name, empty sites Map
    outerMap2.delete(campgroundName1);
    outerMap2.set(campgroundName2, innerMap20);
    expect(searchResultEqual(outerMap1, outerMap2)).toBe(false);

    // Same campgrounds, different order
    outerMap1.set(campgroundName2, innerMap10);
    outerMap2.set(campgroundName1, innerMap20);
    //expect(searchResultEqual(outerMap1, outerMap2)).toBe(true);


});

test('Deeper Map of Map Tests', () => {

    const outerMap1 = new Map();
    const innerMap10 = new Map();
    const outerMap2 = new Map();
    const innerMap20 = new Map();
    const innerMap21 = new Map();
    const campgroundName1 = 'Campground Name 1';
    const campgroundName2 = 'Campground Name 2';
    const site1 = '000';
    const site2 = '001';
    const site3 = '020';
    const site4 = '300';
    
    const availabilities1 = {
        "availabilities": {
            "2022-07-01T00:00:00Z":"Available",
            "2022-07-02T00:00:00Z":"Available",
            "2022-07-03T00:00:00Z":"Available",
        }
    }
    const availabilities2 = {
        "availabilities": {
            "2022-07-02T00:00:00Z":"Available",
            "2022-07-03T00:00:00Z":"Available",
        }
    }

    // Same campgrounds, different sites
    innerMap10.set(site1, availabilities1);
    outerMap1.set(campgroundName1, innerMap10);
    innerMap20.set(site2, availabilities1);
    outerMap2.set(campgroundName1, innerMap20);
    expect(searchResultEqual(outerMap1, outerMap2)).toBe(false);

    // Same campgrounds, same sites, different availabilities
    innerMap20.delete(site2);
    innerMap20.set(site1, availabilities2);
    expect(searchResultEqual(outerMap1, outerMap2)).toBe(false);
    
    // All same
    innerMap20.set(site1, availabilities1);
    expect(searchResultEqual(outerMap1, outerMap2)).toBe(true);


});