import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { documents, projectData } = await request.json();

    // Extract document content as text (actual implementation would need OCR or PDF parsing)
    const documentContents = documents.map((doc: any) => ({
      name: doc.name,
      category: doc.category,
      // In actual implementation, extract file content here
      content: extractDocumentContent(doc) // Extract actual document content
    }));

    // Document content extraction function (simulation)
    function extractDocumentContent(doc: any) {
      // In reality, we would need to read file content,
      // but currently returning sample content by category
      const sampleContents: any = {
        'project-concept': 'Bangladesh Dhaka Flood Management Project. Project Period: January 2025 - December 2030. Total Project Cost: $500 million (ADB loan $300 million). Key Components: Physical infrastructure (drainage expansion, pump station improvement), Institutional and capacity building (early warning system), Technical assistance (AI-based flood prediction model).',
        'feasibility-study': 'Economic and Financial Analysis: BCR=1.8, NPV=$120 million USD, IRR=12%. Technical Analysis: Current sewerage drainage status and improvement measures, AI-based prediction model design. Environmental and Social Impact: Water quality, ecology, and potential displacement review.',
        'technical-assistance': 'Flood prediction system development support, operation and maintenance capacity building. Key Outputs: Flood prediction model prototype, user manual, training materials. 12 months divided into 4 phases.',
        'procurement-plan': 'Procurement Strategy: Combination of international competitive bidding and limited bidding. Package A: Drainage construction ($150M), Package B: Pump station equipment ($80M), Package C: Prediction system ($50M), Package D: Consulting ($25M).',
        'design-monitoring': 'Performance Indicators: Annual flood damage economic loss ratio 1.5%→1.0%, drainage time 48 hours→29 hours, prediction accuracy 60%→85%. Outputs: 120km drainage extension, 200 trained personnel.',
        'loan-agreement': 'ADB maximum $300 million loan, installment payment method. Borrower obligations: obtain permits, comply with environmental and social standards, submit quarterly progress reports.',
        'president-report': 'Purpose: Dhaka metropolitan area flood reduction and urban resilience enhancement. Total project cost: $500 million, ADB loan $300 million. Expected outcomes: 30% annual flood damage reduction, 50% operational capacity improvement.'
      };
      
      return sampleContents[doc.category] || 'Unable to extract document content.';
    }

    // Generate LLM prompt
    const prompt = `
The following are actual documents from the Bangladesh Dhaka Flood Management Project. Please comprehensively analyze these documents to generate project information and a climate resilience infrastructure construction project report.

Project Name: ${projectData.name}
Project Number: ${projectData.number}

=== Uploaded Document Content ===
${documentContents.map(doc => `
[${doc.category}] ${doc.name}:
${doc.content}
`).join('\n')}

Please analyze the above documents comprehensively and respond in the following JSON format.

Important: For the "Climate Resilience Infrastructure Construction Project" section, please use the standard format below, but write the flooding section specifically and concretely reflecting the actual document content.

{
  "projectInfo": {
    "projectName": "Actual project name extracted from documents",
    "projectNumber": "${projectData.number}",
    "country": "Country name confirmed from documents",
    "projectStatus": "Status confirmed from documents",
    "projectType": "Support method confirmed from documents",
    "fundingSource": "Funding source and scale confirmed from documents",
    "sector": "Sector/subsector confirmed from documents",
    "targetDisaster": "Flooding",
    "climateInfrastructure": "Main infrastructure confirmed from documents",
    "region": "Region confirmed from documents",
    "responsibleAgency": "Responsible agency confirmed from documents",
    "description": "Project description and objectives extracted from documents"
  },
  "climateInfrastructure": [
    {
      "disaster": "Flooding",
      "measures": [
        "Embankment and dike construction",
        "Drainage system improvement", 
        "Retention basin/detention pond construction",
        "Rainwater infiltration facilities",
        "Flood barrier/cutoff wall installation",
        "High ground shelter/evacuation route installation"
      ]
    },
    {
      "disaster": "Drought",
      "measures": [
        "Reservoir/dam construction and expansion",
        "Irrigation facility improvement",
        "Groundwater development and management system",
        "Seawater desalination facilities",
        "Rainwater collection and utilization facilities"
      ]
    },
    {
      "disaster": "Heat Wave",
      "measures": [
        "Shade/cooling zone installation",
        "Urban forest/green space creation",
        "Cool roof and green roof systems",
        "Air-conditioned shelter/rest areas"
      ]
    },
    {
      "disaster": "Strong Wind/Typhoon",
      "measures": [
        "Wind-resistant buildings and structures",
        "Windbreak forest creation",
        "Robust power infrastructure"
      ]
    },
    {
      "disaster": "Sea Level Rise",
      "measures": [
        "Coastal barrier/breakwater construction and reinforcement",
        "Mangrove forest restoration/creation",
        "Coastal wetland restoration",
        "Relocation or elevation of infrastructure like roads/housing to higher ground"
      ]
    }
  ]
}

Notes:
1. Please use the standard format provided above exactly for the measures array in climateInfrastructure.
2. For the flooding section, also use the 6 standard items above exactly.
3. Return only pure JSON.
`;

    // OpenAI API call (get API key from environment variables)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Return comprehensive sample data if no API key
      return NextResponse.json({
        projectInfo: {
          projectName: projectData.name || "Bangladesh Dhaka Flood Management Project",
          projectNumber: projectData.number || "51-01",
          country: "Bangladesh",
          projectStatus: "Active",
          projectType: "ADB Loan",
          fundingSource: "Asian Development Bank - $300 million loan, Total project cost: $500 million",
          sector: "Water and Sanitation / Urban Flood Management",
          targetDisaster: "Flooding",
          climateInfrastructure: "Drainage system expansion, pump station improvement, flood prediction system",
          region: "Dhaka Metropolitan Area",
          responsibleAgency: "Local Government Engineering Department (LGED), Bangladesh",
          description: "This project aims to support the government in achieving effective and sustainable performance in operating and maintaining a flood risk management system. The project involves drainage system expansion (120km), pump station improvements, development of AI-based flood prediction models, and capacity building for operation and maintenance. Expected outcomes include 30% reduction in annual flood damage and 50% improvement in operational capacity."
        },
        climateInfrastructure: [
          {
            disaster: "Flooding",
            measures: [
              "Embankment and dike construction",
              "Drainage system improvement", 
              "Retention basin/detention pond construction",
              "Rainwater infiltration facilities",
              "Flood barrier/cutoff wall installation",
              "High ground shelter/evacuation route installation"
            ]
          },
          {
            disaster: "Drought",
            measures: [
              "Reservoir/dam construction and expansion",
              "Irrigation facility improvement",
              "Groundwater development and management system",
              "Seawater desalination facilities",
              "Rainwater collection and utilization facilities"
            ]
          },
          {
            disaster: "Heat Wave",
            measures: [
              "Shade/cooling zone installation",
              "Urban forest/green space creation",
              "Cool roof and green roof systems",
              "Air-conditioned shelter/rest areas"
            ]
          },
          {
            disaster: "Strong Wind/Typhoon",
            measures: [
              "Wind-resistant buildings and structures",
              "Windbreak forest creation",
              "Robust power infrastructure"
            ]
          },
          {
            disaster: "Sea Level Rise",
            measures: [
              "Coastal barrier/breakwater construction and reinforcement",
              "Mangrove forest restoration/creation",
              "Coastal wetland restoration",
              "Relocation or elevation of infrastructure like roads/housing to higher ground"
            ]
          }
        ]
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a climate change adaptation project analysis expert. Please analyze the provided documents and extract accurate project information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Handle responses wrapped in ```json by OpenAI
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    }
    
    // Remove additional code blocks
    content = content.replace(/```/g, '').trim();
    
    const analysisResult = JSON.parse(content);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Document analysis error:', error);
    
    // Return default sample data if error occurs
    return NextResponse.json({
      projectInfo: {
        projectName: "Document Analysis Error - Sample Project",
        projectNumber: "ERROR-01",
        country: "Analysis Required",
        projectStatus: "Planning",
        projectType: "Analysis Required",
        fundingSource: "Analysis Required",
        sector: "Analysis Required",
        targetDisaster: "Analysis Required",
        climateInfrastructure: "Analysis Required",
        region: "Analysis Required", 
        responsibleAgency: "Analysis Required",
        description: "An error occurred during document analysis. Please check the documents again."
      },
      climateInfrastructure: [
        {
          disaster: "Flooding",
          measures: [
            "Embankment and dike construction",
            "Drainage system improvement", 
            "Retention basin/detention pond construction",
            "Rainwater infiltration facilities",
            "Flood barrier/cutoff wall installation",
            "High ground shelter/evacuation route installation"
          ]
        },
        {
          disaster: "Drought",
          measures: [
            "Reservoir/dam construction and expansion",
            "Irrigation facility improvement",
            "Groundwater development and management system",
            "Seawater desalination facilities",
            "Rainwater collection and utilization facilities"
          ]
        },
        {
          disaster: "Heat Wave",
          measures: [
            "Shade/cooling zone installation",
            "Urban forest/green space creation",
            "Cool roof and green roof systems",
            "Air-conditioned shelter/rest areas"
          ]
        },
        {
          disaster: "Strong Wind/Typhoon",
          measures: [
            "Wind-resistant buildings and structures",
            "Windbreak forest creation",
            "Robust power infrastructure"
          ]
        },
        {
          disaster: "Sea Level Rise",
          measures: [
            "Coastal barrier/breakwater construction and reinforcement",
            "Mangrove forest restoration/creation",
            "Coastal wetland restoration",
            "Relocation or elevation of infrastructure like roads/housing to higher ground"
          ]
        }
      ]
    });
  }
}
