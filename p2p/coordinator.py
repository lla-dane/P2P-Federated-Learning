from logs import setup_logging
import trio
import base58
import logging

logger = setup_logging("coordinator")

async def wait_for_subscribers_and_broadcast(pubsub, topic, termination_event, threshold: int = 1):
    await trio.sleep(1)
    logger.info(f"Cordinator waiting for {threshold} subscribers...")
    while not termination_event.is_set():
        # Count the peers that are subscribed to out topic
        subscribed_peers = list(pubsub.peers.keys())
        print(subscribed_peers)
        
        if len(subscribed_peers) >= threshold:
            logger.info(f"{threshold} peers detected, broadcasting the peices...")
            message = "DEEP LEARNING CHUNK"
            await trio.sleep(1)
            await pubsub.publish(topic, message.encode())
            break
        await trio.sleep(2) # check every 2 seconds
        
async def receive_loop(subscription, termination_event):
    print("Starting receive loop...")
    while not termination_event.is_set():
        try:
            message = await subscription.get()
            print(f"From peer: {base58.b58encode(message.from_id).decode()}")
            print(f"Received message: {message.data.decode('utf-8')}")
        except Exception:
            print("ERROR IN THE RECEIVE LOOP")
            await trio.sleep(1)
            
async def publish_loop(pubsub, topic, termination_event):
    print("Starting publish loop...")
    print("Type messages tp send (press Enter to send):")
    while not termination_event.is_set():
        try:
            message = await trio.to_thread.run_sync(input)
            if message.lower() == "quit":
                termination_event.set()
                break
            if message:
                print(f"Publishing message: {message}")
                await pubsub.publish(topic, message.encode())
                print(f"Published: {message}")
        except Exception:
            print("ERROR IN PUBLISH LOOP")
            await trio.sleep(1)
            
async def monitor_peer_topics(pubsub, nursery, termination_event):
    subscribed_topics = set()
    
    while not termination_event.is_set():
        for topic in pubsub.peer_topics.keys():
            if topic not in subscribed_topics:
                print(f"Auto-subscribing to new topic: {topic}")
                subscription = await pubsub.subscribe(topic)
                subscribed_topics.add(topic)
                
                nursery.start_soon(receive_loop, subscription, termination_event)
                
        await trio.sleep(2)
        
        