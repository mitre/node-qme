# node-qme
This project is an abstract implementation of the quality-measure-engine used by
Bonnie/Cypress/popHealth. It provides the ability to calculate electronic
clinical quality measures given a PatientSource.

This package does not provide any PatientSource implementations. It is expected
that this library will be used by other libraries, such as [node-cqm-engine](https://github.com/mitre/node-cqm-engine),
which provides a PatientSource that pulls data from MongoDB.

## PatientSource
Users of this library are expected to provide a PatientSource for the Executor
to use to obtain patient data. A PatientSource must implement the following
functions:
* next - This function takes no arguments. It provides the next Patient object
from its underlying data source. The returned Patient objects are expected to be
instances of the Patient class in [fhir-patient-api](https://github.com/mitre/fhir-patient-api).
* reset - This function takes no arguments, but should cause the PatientSource
to restart its iteration from the first patient.

It is expected that the PatientSource passed to the Executor will be initialized
and ready to read from whatever underlying data source it uses (database, flat
file, etc).

# License
Copyright 2016 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
