# Kubernetes intro
## Terminology
### Cluster
Collection of nodes + a master to manage them
### Node
A virtual machine to run containers. A cluster has one node by default and can create more.
### Pod
A wrapper that runs containers. We'll only use one container by pod in this lecture.
### Deployment
Manage a set of pods and restart them when they crash.
### Service
Allows the distribution of request among pods + provides easy to remember URL.
Deployments, Pods and Services are collectively known as Objects.

## Config files
Kubernetes config files are written in YAML.

First, build docker with a version number.
```
docker build -t gaetz/simpleweb:0.0.1 .
```
We then create a infra/k8s subfolder and create our yaml file inside. Yaml files use 2 spaces indentation.

simpleweb.yaml
```
apiVersion: v1                          # The set of objects we want k8s do look at
kind: Pod                               # Type of object you want to create
metadata:
  name: simpleweb                       # Name of the created pod
spec:                                   # Attributes of the object
  containers:                           # We can create multiple containers in the pod
    - name: simpleweb                   # Name of the container (different of the pod's name) (dash is a yaml array)
      image: gaetz/simpleweb:0.0.1      # Name and version of the image we will use 
                                        # Default version is latest: if latest, go to docker hub.
                                        # If version is specified, assume it is on the current machine.
```
We now have to tell kubernetes to start the pod:
```
cd infra/k8s
kubectl apply -f simpleweb.yaml
```

## Kubernates commands
Gett all running pods:
```
kubectl get pods
```
As in docker:
```
kubectl exec -it [pod name] <command>
```
```
kubectl logs [pod name]
```
Other commands:
```
kubectl delete pod [pod name]
```
```
kubectl apply -f [config file name]     # Process the config file
```
```
kubectl describe pod [pod name]         # Give info about the pod
```

## Deployment
### Create a deployment
Usually, we don't want to use individual k8s config. We want to configure deplyments of multiple pods. We create a specific file for deployments:

simpleweb-depl.yaml
```
apiVersion: apps/v1                 # deployments are in the app folder
kind: Deployment
metadata:
  name: simpleweb-depl              # name of the deployment
spec:
  replicas: 1                       # number of pods
  selector:                         # look for the pods with label "app: pods"
    matchLabels:
      app: simpleweb
  template:                         # configuration of the pod 
    metadata:
      labels:
        app: simpleweb              # our pod will have label "app: pods"
    spec:                           # Attributes of the object
      containers:                   # We can create multiple containers 
        - name: simpleweb 
          image: gaetz/simpleweb:0.0.1
```

To launch the deployment, you run:
```
kubectl apply -f [config file name]
```

Other commands:
You can get pods to see running pods. 
```
kubectl get deployments
```
If you delete a pod, the deployment will try to create a new one.
You can get info about deplayments :
```
kubectl describe deployment [deployment name]
```
And also kill them:
```
kubectl delete deployment [deployment name]
```
### Update a deployment
Change your deployment file to use latest version of your image (delete the version). Then redeploy.

Make a change into your app and update the server startup log. Rebuild it with docker. Then we'll upload it on dockerhub. You first need an account on hub.docker.com. Then:
```
docker push [docker hub name]/[image name]
```
Then update the deployment:
```
kubectl rollout restart deployment [deployment name]
```
You can check your new version is running by watching its updated log:
```
kubectl logs [pod name]
```

## Services
How to make multiple app discuss together.

We'll now go back to our blog application. Create a docker image and a pod for the posts.

There are several types of services:
### Cluster IP
Setup easy to remumber url to access a pod. Pods are exposed in the cluster.
### Node Port
Makes a pod accessible outside the cluster. Only for dev purpose.
### Load Balancer
Makes a pod accessible outside the cluster. Right way to expose to the world.
### External Name
Redirect an in-cluster request to a CNAME url (advanced)

## Simple service with node port
We'll use a node port because for now we only have one pod.

Create a posts-srv.yaml file:
```
apiVersion: v1
kind: Service
metadata:
  name: posts-srv
spec:
  type: NodePort
  selector:
    app: posts          # Node port for "app: port" label pods
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```
Deploy the service with:
```
kubectl apply -f posts-srv.yaml
```
List services :
```
kubectl get services
```
You see there is a 3xxxx port. This is the port we can use to access our application from outside the cluster. You'll use localhost:3xxxx/posts to access the app. This adress is only for development purposes.

To get info, you can also use:
```
kubectl describe service [service name]
```
## Communication between pods with Cluster IP
We want to expose a pod to other pods. We'll expose posts and event-bus.

