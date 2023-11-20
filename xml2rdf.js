const fs = require("fs");
const xml2js = require("xml2js");
const builder = new xml2js.Builder({ headless: true, rootName: "rdf:RDF" });

// Find an attribute by name in the product attributes array
function findAttribute(attributes, name) {
    const attribute = attributes.find(attr => attr.$.name === name);
    return attribute ? attribute._ : undefined;
}

// Find an attribute with a fallback option
function findAttributeWithFallback(attributes, primaryName, fallbackName) {
    const primaryAttribute = findAttribute(attributes, primaryName);
    if (primaryAttribute !== undefined) {
        return primaryAttribute;
    }
    return findAttribute(attributes, fallbackName) || '';
}

//Process channel attributes and create RDF descriptions
function processChannelAttributes(product, channelAttributes) {
    return channelAttributes.map(attr => {
        return {
            '$': { 'rdf:about': `https://data.luxottica.com/wl164989/${product.id[0]}` },
            'rdf:type': {
                 '$': { 'rdf:resource': 'https://purl.archive.org/purl/eyewear/ChannelAttributes' }
            },
            'channel': { '_': attr.$.channel, '$': { 'xmlns': 'https://purl.archive.org/purl/eyewear/' } },
            'styleName': { 
                '_': findAttributeWithFallback(product.Attributes[0].attribute, 'Model Name', 'Model Code Display'), 
                '$': { 'xmlns': 'https://purl.archive.org/purl/eyewear/' } 
            }
        };
    });
}

// Read and parse the XML file
fs.readFile("b2b_part_1.xml", (err, data) => {
  if (err) throw err;
  xml2js.parseString(data, (err, result) => {
    if (err) throw err;

    let rdfDescriptions = [];
    const products = result.Products.Product;
    products.forEach((product) => {
      const attributes = product.Attributes[0].attribute;

      // Process and add general product attributes
      const generalAttributes = {
        $: {
          "rdf:about": `https://data.luxottica.com/wl164989/${product.id[0]}`,
        },
        "rdf:type": {
          $: { "rdf:resource": "http://schema.org/Product" },
        },
        brand: {
          _: findAttribute(attributes, "Brand"),
          $: { xmlns: "http://schema.org/" },
        },
        name: { _: product.id[0], $: { xmlns: "http://schema.org/" } },
        category: {
          _: 'Optical',
          $: { xmlns: "https://purl.archive.org/purl/eyewear/" },
        },
        
      };

      // Add attributes only if they are found
      /*
      const attributeKeys = [
        "Brand",
        "Product Type",
        "Material Type",
        "Bridge Type",
        "Frame Shape",
        "Face Shape",
        "Frame Fitting",
        "Front Color Finish",
        "Front Color",
        "Gender",
        "Macro Age Range",
        "Age Group Enumeration",
        "Lens Assembly Type On Frame",
        "Type Frame A",
        "Lens Material",
        "Temple Material",
        "Nosepad Type",
        "Release",
        "Special Project Collection",
        "Special Project Sponsor",
        "Special Project Type",
        "Special Project Features Flag",
        "Lens Treatment",
        "Lens Color",
        "Temple Color",
        "Brand",
        "Eyewear Product Group",
        "Product Style Name",
        "Product Family Model",
        "Frame Foldability",
        "Roxability",
        "Is Lens Photochromic",
        "Is Lens Polar",
        "Model Code Display",
        "Progressive Friendly",
        "Material Type",
        "Mask Shield",
        "Strass Presence",
        "Strass Position",
        "Lens Contrast Enhancement",
        "Lens Base Curve",
        "Is Lens Gradient",
        "Is Lens Mirror",
        "Lens Blue Light Filtered",
        "Model Name",
        "Lens Protection",
        "Front Material",
        "Model Fit",
        // Add other attribute keys here
      ];

      attributeKeys.forEach((key) => {
        const value = findAttribute(attributes, key);
        if (value !== undefined) {
          const camelCaseKey = key
            .split(" ")
            .map((word, index) =>
              index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join("");
          generalAttributes[camelCaseKey] = {
            _: value,
            $: { xmlns: "https://purl.archive.org/purl/eyewear/" },
          };
        }
      });*/

      const attributeMappings = {
        //"Brand" : "brand",
        //"Product Type" : "",
        "Bridge Type" : "bridgeType",
        "Frame Shape" : "frameShape",
        "Face Shape" : "faceShape",
        "Frame Fitting" : "frameFitting",
        "Front Color Finish" : "frontColorFinish",
        "Front Color" : "frontColor",
        "Gender" : "genderType",
        "Macro Age Range" : "macroAgeRange",
        "Age Group Enumeration" : "ageGroupEnumeration",
        "Lens Assembly Type On Frame" : "lensAssemblyTypeOnFrame",
        "Type Frame A" : "frameType",
        "Lens Material" : "eyewearLensMaterial",
        "Temple Material" : "eyewearTempleMaterial",
        "Nosepad Type" : "nosepadType",
        "Release" : "release",
        "Special Project Collection" : "specialProjectCollection",
        "Special Project Sponsor" : "specialProjectSponsor",
        "Special Project Type" : "specialProjectType",
        "Special Project Features Flag" : "specialProjectFeaturesFlag",
        "Lens Treatment" : "lensTreatment",
        "Lens Color" : "lensColor",
        "Temple Color" : "templeColor",
        "Product Type" : "eyewearProductGroup",
        "Product Style Name" : "productStyleName",
        "Family Model" : "productFamilyModel",
        "Foldable Frame" : "frameFoldability",
        "Roxability" : "roXability",
        "Lens - Is Photocromic" : "isLensPhotochromic",
        "Lens - Is Polar" : "isLensPolar",
        "Model Code Display" : "modelCodeDisplay",
        "Progressive Friendly" : "progressiveFriendly",
        "Material Type" : "materialType",
        "Mask/Shield" : "maskShield",
        "Strass Presence" : "strassPresence",
        "Strass Position" : "strassPosition",
        "Lens Contrast Enhancement" : "lensContrastEnhancement",
        "Lens Base" : "lensBaseCurve",
        "Lens - Is Gradient" : "isLensGradient",
        "Lens - Is Mirror" : "isLensMirror",
        "Lens –Blue Light Filter" : "isLensBlueLightFiltered",
        "Model Name" : "modelName",
        "Front Material" : "frontMaterial",
        "Lens Protection" : "lensProtection" ,
        "Model Fit" : "modelFit",
    };
    
    Object.entries(attributeMappings).forEach(([originalKey, customKey]) => {
        const value = findAttribute(attributes, originalKey);
        if (value !== undefined) {
            generalAttributes[customKey] = { '_': value, '$': { 'xmlns': 'https://purl.archive.org/purl/eyewear/' } };
        }
    });

      rdfDescriptions.push(generalAttributes);

      // Process channel attributes
      const channelAttributes = product["channel-attributes"][0].attribute;
      const productRdfDescriptions = processChannelAttributes(
        product,
        channelAttributes
      );
      rdfDescriptions = rdfDescriptions.concat(productRdfDescriptions);
    });

    // Build RDF content
    const rdfContent = builder.buildObject({
      "rdf:Description": rdfDescriptions,
    });

    // Write RDF content to a new file
    fs.writeFile("output_b2b_part_1_1.rdf", rdfContent, (err) => {
      if (err) throw err;
      console.log("RDF file has been saved!");
    });
  });
});
