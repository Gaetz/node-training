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

### Deploy services

In this first attempt to make pods communicate, we'll assign manually a Cluster IP service to each pod. Each pod will communicate with the cluster IP service of the other one. Nevertheless, we'll use an automation tool later.

Start by create an image for the event bus, push the image to docker hub, create a deployment for event bus.

Now we'll create a Cluster IP service for the posts and event bus deployment.

We can use the deployment file to configure the event-bus cluster ip, by adding "---" at the end of the first part of the file.

```
[previous code]
---
apiVersion: v1
kind: Service
metadata:
  name: event-bus-srv
spec:
  selector:
    app: event-bus
  type: ClusterIP
  ports:
    - name: event-bus
      protocol: TCP
      port: 4005
      targetPort: 4005
```

Let's now add the cluster IP service for posts in the post-depl file.
```
[previous code]
---
apiVersion: v1
kind: Service
metadata:
  name: posts-clusterip-srv
spec:
  selector:
    app: posts
  type: ClusterIP
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```

### Wiring-up pods
For now, our post app send request to localhost:4005 to reach the event bus.
The event bus, send a request to localhost:400 to reach the posts app.

We have to replace http://localhost:4005 by http://event-bus-srv:4005 in posts, and http://localhost:4001 by http://posts-clusterip-srv:4001 in event-bus. Comment out the event bus communication with other app, because for now they are not ready to use k8s.

Then build the docker images and push them to docker hub.

Now we need to redeploy and restart:
```
kubectl rollout restart deployment posts-depl
kubectl rollout restart deployment event-bus-depl
```
Verify pods are running:
```
kubectl get pods
```

Let's now use postman to test the wiring. Get the NodePort port to send your post creation request (POST http://localhost:3xxxx/posts).

Then verify the messages were exchanged between the two services by displaying the logs of the posts pods. You should have "Received event: PostCreated".

Now update your other microservices to wire up all the application. You can run kubectl apply in a whole directory if you don't want to type multiple commands. Then check all pods are running.

Now, in event-bus, change the urls to reach the different services. Rebuild with dochent and rollout restart the event-bus deployment. Test with postman if communication works.

## Integrate React application
Note that once react app is loaded on the client brower, it is the client browser that send request to pods, not the react application.
### Ingress
We'll use a Load Balancer service that our react app will adress. This load balancer will be configured to send the requests to the cluster ip services.

We can distinguish Load Balancers and Ingress. 
With a Load Balancer config file, we ask the cluster to reach out the cloud provider (amazon aws, azure...) and use the cloud's loadbalancer to send traffic to a specific pod.
On the other hand, Ingress controller is in the cluster, and distribute traffic to a set of different pods. We can still have a load balancer in front of the Ingress.

We'll use the ingress-nginx package, that is an ingress + a load balancer. 

### Installing ingress-nginx

* Make sure git is installed
* Run this script
```
(
  set -x; cd "$(mktemp -d)" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/krew.tar.gz" &&
  tar zxvf krew.tar.gz &&
  KREW=./krew-"$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed -e 's/x86_64/amd64/' -e 's/arm.*$/arm/')" &&
  "$KREW" install krew
)
```
* Open your .bashrc file and add:
```
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```
* Restart your shell
* Verify `kubectl krew` works
* Now the k8s package manager is installed. Run :
```
kubectl krew install ingress-nginx
```
* Run the command:
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.40.1/deploy/static/provider/cloud/deploy.yaml
```

### Config file for ingress-nginx

We start by creating an ingress for the posts routes.
```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts
            backend:
              serviceName: posts-clusterip-srv
              servicePort: 4000
```
`host: posts.com` means that we will connect to a false posts.com website to go to localhost. Ingress want us to connect from a domain. To trick our computer to think we go through posts.com when we want to go local host, we will edit our /etc/hosts file.

Send a GET request to posts.com/posts to check everything works:
```
curl posts.com/posts
```
You should obtain the JSON with the posts.
(Unfortunatly under Windows/WSL, you cannot use your navigator.)