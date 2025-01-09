import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Brain, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function AutoMLDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [dataStats, setDataStats] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData);
      setDataStats(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      const response = await axios.post(`${API_URL}/train`);
      setModelMetrics(response.data);
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'model.pkl');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading model:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Visuallab Dashboard</h1>
          <p className="text-gray-600">Machine Learning Specialist Agent</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload
            </TabsTrigger>
            <TabsTrigger value="profiling" className="flex items-center gap-2">
              <FileText size={16} />
              Profiling
            </TabsTrigger>
            <TabsTrigger value="modeling" className="flex items-center gap-2">
              <Brain size={16} />
              Modeling
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download size={16} />
              Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />

                  {dataStats && (
                    <>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{dataStats.rows}</div>
                            <div className="text-xs text-gray-500">Rows</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{dataStats.columns}</div>
                            <div className="text-xs text-gray-500">Columns</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{dataStats.missingValues}</div>
                            <div className="text-xs text-gray-500">Missing Values</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Dataset Preview</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(dataStats.preview[0]).map(header => (
                                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {dataStats.preview.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((value, j) => (
                                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modeling">
            <Card>
              <CardHeader>
                <CardTitle>Model Training</CardTitle>
              </CardHeader>
              <CardContent>
                {!dataStats ? (
                  <Alert>
                    <AlertDescription>
                      Please upload a dataset first to begin modeling.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleTrain} 
                      disabled={isTraining}
                      className="w-full"
                    >
                      {isTraining ? 'Training...' : 'Train Models'}
                    </Button>

                    {modelMetrics && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modelMetrics.accuracy.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modelMetrics.precision.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Precision</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modelMetrics.recall.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Recall</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modelMetrics.f1Score.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">F1 Score</div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download">
            <Card>
              <CardHeader>
                <CardTitle>Download Model</CardTitle>
              </CardHeader>
              <CardContent>
                {!modelMetrics ? (
                  <Alert>
                    <AlertDescription>
                      No trained model available. Please train a model first!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button onClick={handleDownload} className="w-full">
                    Download Model
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
